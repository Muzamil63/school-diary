<?php

namespace App\Listeners;

use App\Events\DiaryEntryCreated;
use App\Models\ParentProfile;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\User;
use App\Notifications\NewDiaryEntryNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

/**
 * Queued listener — fires after a diary entry is created.
 * Sends in-app (database) notifications to affected students and parents.
 * Implements ShouldQueue so Laravel dispatches this on the background queue,
 * preventing notification I/O from blocking the HTTP response.
 */
class NotifyStudentsAndParents implements ShouldQueue
{
    use InteractsWithQueue;

    public string $queue = 'notifications';
    public int $tries = 3;

    public function handle(DiaryEntryCreated $event): void
    {
        $entry = $event->entry->load(['class.students.user', 'class.students.parents.user']);

        $recipients = collect();

        if ($entry->type === 'remark' && $entry->student_id) {
            // Single student remark
            $recipients = $this->collectStudentAndParents($entry->student_id);
        } elseif ($entry->class_id) {
            // Homework or announcement for an entire class
            $entry->class->students->each(function (Student $student) use (&$recipients) {
                $recipients = $recipients->merge(
                    $this->collectStudentAndParents($student->user_id)
                );
            });
        }
        // If class_id is null — school-wide announcement; notify all students/parents
        else {
            $recipients = User::whereIn('role', ['student', 'parent'])
                ->where('status', 'active')
                ->get();
        }

        $recipients->unique('id')->each(function (User $user) use ($entry) {
            try {
                $user->notify(new NewDiaryEntryNotification($entry));
            } catch (\Throwable $e) {
                Log::error("Failed to notify user #{$user->id}: " . $e->getMessage());
            }
        });
    }

    private function collectStudentAndParents(int $studentUserId): Collection
    {
        $studentUser = User::find($studentUserId);
        $recipients  = collect($studentUser ? [$studentUser] : []);

        // Add all parents linked to this student
        $student = Student::where('user_id', $studentUserId)->first();
        if ($student) {
            $student->parents()->with('user')->get()->each(
                fn(ParentProfile $p) => $p->user && $recipients->push($p->user)
            );
        }

        return $recipients;
    }

    /**
     * Handle a job failure (log and release back to queue with delay).
     */
    public function failed(DiaryEntryCreated $event, \Throwable $exception): void
    {
        Log::error('NotifyStudentsAndParents failed', [
            'entry_id' => $event->entry->id,
            'error'    => $exception->getMessage(),
        ]);
    }
}
