<?php

namespace App\Policies;

use App\Models\DiaryEntry;
use App\Models\User;

class DiaryEntryPolicy
{
    /**
     * Admins can view all entries; teachers see their own;
     * students/parents see only what is relevant to them.
     */
    public function view(User $user, DiaryEntry $entry): bool
    {
        return match ($user->role) {
            'admin'   => true,
            'teacher' => $entry->teacher_id === $user->id,
            'student' => $this->studentCanView($user, $entry),
            'parent'  => $this->parentCanView($user, $entry),
            default   => false,
        };
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['admin', 'teacher'], true);
    }

    public function update(User $user, DiaryEntry $entry): bool
    {
        if ($user->isAdmin()) return true;

        return $user->isTeacher() && $entry->teacher_id === $user->id;
    }

    public function delete(User $user, DiaryEntry $entry): bool
    {
        if ($user->isAdmin()) return true;

        return $user->isTeacher() && $entry->teacher_id === $user->id;
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private function studentCanView(User $user, DiaryEntry $entry): bool
    {
        if ($entry->type === 'remark') {
            return $entry->student_id === $user->id;
        }

        // Homework/announcement: student must be in the target class
        if (! $entry->class_id) return true; // school-wide

        return $user->student?->class_id === $entry->class_id;
    }

    private function parentCanView(User $user, DiaryEntry $entry): bool
    {
        $childUserIds = $user->parentProfile?->students()
            ->pluck('user_id')
            ->toArray() ?? [];

        if ($entry->type === 'remark') {
            return in_array($entry->student_id, $childUserIds, true);
        }

        if (! $entry->class_id) return true; // school-wide announcement

        // Check if any child is in the target class
        return \App\Models\Student::whereIn('user_id', $childUserIds)
            ->where('class_id', $entry->class_id)
            ->exists();
    }
}
