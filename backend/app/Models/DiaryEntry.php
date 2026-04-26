<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class DiaryEntry extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'teacher_id',
        'type',
        'title',
        'description',
        'class_id',
        'subject_id',
        'student_id',
        'due_date',
        'version',
        'status',
    ];

    protected $casts = [
        'due_date' => 'date',
    ];

    // ─── Relationships ───────────────────────────────────────────────────────

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function class(): BelongsTo
    {
        return $this->belongsTo(SchoolClass::class, 'class_id');
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    // ─── Scopes ──────────────────────────────────────────────────────────────

    public function scopeForStudent($query, int $studentUserId)
    {
        return $query->where(function ($q) use ($studentUserId) {
            // Homework/announcements for their class
            $q->whereIn('type', ['homework', 'announcement'])
              ->whereHas('class.students', fn($s) => $s->where('user_id', $studentUserId));
        })->orWhere(function ($q) use ($studentUserId) {
            // Personal remarks directed at this student
            $q->where('type', 'remark')
              ->where('student_id', $studentUserId);
        });
    }

    public function scopeForParent($query, int $parentUserId)
    {
        // Get student IDs linked to this parent
        $studentUserIds = ParentProfile::where('user_id', $parentUserId)
            ->with('students.user')
            ->get()
            ->flatMap(fn($p) => $p->students->pluck('user_id'))
            ->unique()
            ->values();

        return $query->where(function ($q) use ($studentUserIds) {
            // Homework and announcements for their children's classes
            $q->whereIn('type', ['homework', 'announcement'])
              ->whereHas('class.students', fn($s) => $s->whereIn('user_id', $studentUserIds));
        })->orWhere(function ($q) use ($studentUserIds) {
            // Remarks targeting their children
            $q->where('type', 'remark')
              ->whereIn('student_id', $studentUserIds);
        });
    }

    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }
}
