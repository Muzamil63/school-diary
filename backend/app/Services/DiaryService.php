<?php

namespace App\Services;

use App\Events\DiaryEntryCreated;
use App\Models\DiaryEntry;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

class DiaryService
{
    /**
     * Retrieve diary entries visible to the given user (role-based filtering).
     */
    public function getEntriesForUser(User $user, array $filters, int $perPage = 10): LengthAwarePaginator
    {
        $query = DiaryEntry::query()
            ->published()
            ->with(['teacher:id,name', 'class:id,name', 'subject:id,name', 'student:id,name']);

        // ── Role-based scoping ─────────────────────────────────────────────
        match ($user->role) {
            'admin'   => null,                                            // Admins see everything
            'teacher' => $query->where('teacher_id', $user->id),         // Teachers see their own entries
            'student' => $query->forStudent($user->id),
            'parent'  => $query->forParent($user->id),
        };

        // ── Optional filters ───────────────────────────────────────────────
        if (! empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }
        if (! empty($filters['class_id'])) {
            $query->where('class_id', $filters['class_id']);
        }
        if (! empty($filters['subject_id'])) {
            $query->where('subject_id', $filters['subject_id']);
        }
        if (! empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }
        if (! empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }
        if (! empty($filters['search'])) {
            $term = '%' . $filters['search'] . '%';
            $query->where(fn($q) => $q->where('title', 'like', $term)
                                      ->orWhere('description', 'like', $term));
        }

        return $query->orderByDesc('created_at')->paginate($perPage);
    }

    /**
     * Create a diary entry inside a DB transaction with a pessimistic advisory lock
     * per teacher to prevent duplicate concurrent submissions.
     */
    public function create(array $data): DiaryEntry
    {
        $teacherId = $data['teacher_id'];

        // Atomic lock per teacher (Redis or cache-based) — 30-second TTL
        $lock = Cache::lock("diary_create_teacher_{$teacherId}", 30);

        return $lock->block(10, function () use ($data) {
            return DB::transaction(function () use ($data) {
                $entry = DiaryEntry::create($data);

                // Fire event so listeners can send notifications
                event(new DiaryEntryCreated($entry));

                return $entry;
            });
        });
    }

    /**
     * Update with optimistic locking: reject if the version has advanced (concurrent edit).
     */
    public function update(DiaryEntry $entry, array $data, ?int $clientVersion = null): DiaryEntry
    {
        return DB::transaction(function () use ($entry, $data, $clientVersion) {
            // Re-fetch with a row-level lock to prevent lost updates
            $locked = DiaryEntry::lockForUpdate()->findOrFail($entry->id);

            if ($clientVersion !== null && $locked->version !== $clientVersion) {
                throw new ConflictHttpException(
                    'This entry was modified by another user. Please refresh and try again.'
                );
            }

            $locked->fill($data);
            $locked->version += 1;   // Increment version on every successful update
            $locked->save();

            return $locked;
        });
    }

    /**
     * Soft-delete a diary entry.
     */
    public function delete(DiaryEntry $entry): void
    {
        DB::transaction(fn() => $entry->delete());
    }

    /**
     * Serialize an entry model for API responses.
     */
    public function formatEntry(DiaryEntry $entry): array
    {
        return [
            'id'           => $entry->id,
            'type'         => $entry->type,
            'title'        => $entry->title,
            'description'  => $entry->description,
            'due_date'     => $entry->due_date?->toDateString(),
            'status'       => $entry->status,
            'version'      => $entry->version,
            'class_id'     => $entry->class_id,
            'class_name'   => $entry->class?->name,
            'subject_id'   => $entry->subject_id,
            'subject_name' => $entry->subject?->name,
            'teacher_id'   => $entry->teacher_id,
            'teacher_name' => $entry->teacher?->name,
            'student_id'   => $entry->student_id,
            'student_name' => $entry->student?->name,
            'created_at'   => $entry->created_at->toISOString(),
            'updated_at'   => $entry->updated_at->toISOString(),
        ];
    }
}
