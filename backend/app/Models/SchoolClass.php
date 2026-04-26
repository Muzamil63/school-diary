<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class SchoolClass extends Model
{
    use HasFactory;

    protected $table = 'classes';

    protected $fillable = [
        'name',
        'section',
        'academic_year',
    ];

    // ─── Relationships ───────────────────────────────────────────────────────

    public function students(): HasMany
    {
        return $this->hasMany(Student::class, 'class_id');
    }

    public function teachers(): BelongsToMany
    {
        return $this->belongsToMany(Teacher::class, 'class_teacher')
            ->withPivot('subject_id')
            ->withTimestamps();
    }

    public function diaryEntries(): HasMany
    {
        return $this->hasMany(DiaryEntry::class, 'class_id');
    }

    // ─── Accessors ────────────────────────────────────────────────────────────

    public function getStudentCountAttribute(): int
    {
        return $this->students()->count();
    }
}
