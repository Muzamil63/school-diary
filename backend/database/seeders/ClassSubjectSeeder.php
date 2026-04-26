<?php

namespace Database\Seeders;

use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Database\Seeder;

class ClassSubjectSeeder extends Seeder
{
    public function run(): void
    {
        // ── Subjects ────────────────────────────────────────────────────────
        $subjects = collect([
            ['name' => 'Mathematics',       'code' => 'MATH'],
            ['name' => 'Science',           'code' => 'SCI'],
            ['name' => 'English Literature','code' => 'ENG'],
            ['name' => 'History',           'code' => 'HIST'],
            ['name' => 'Computer Science',  'code' => 'CS'],
            ['name' => 'Physics',           'code' => 'PHY'],
            ['name' => 'Chemistry',         'code' => 'CHEM'],
        ])->map(fn($s) => Subject::create($s));

        // ── Classes ─────────────────────────────────────────────────────────
        $classes = collect([
            ['name' => 'Grade 10-A', 'section' => 'A'],
            ['name' => 'Grade 10-B', 'section' => 'B'],
            ['name' => 'Grade 11-A', 'section' => 'A'],
            ['name' => 'Grade 11-B', 'section' => 'B'],
            ['name' => 'Grade 12-A', 'section' => 'A'],
        ])->map(fn($c) => SchoolClass::create($c));

        // ── Assign students to Grade 10-A ────────────────────────────────
        $class10A = $classes->first();

        Student::all()->each(
            fn(Student $s) => $s->update(['class_id' => $class10A->id])
        );

        // ── Assign teachers to classes ────────────────────────────────────
        $teacher1 = Teacher::whereHas('user', fn($q) => $q->where('email', 'j.anderson@school.edu'))->first();
        $teacher2 = Teacher::whereHas('user', fn($q) => $q->where('email', 'e.carter@school.edu'))->first();
        $teacher3 = Teacher::whereHas('user', fn($q) => $q->where('email', 'o.taylor@school.edu'))->first();

        if ($teacher1) {
            $teacher1->classes()->attach($class10A->id, ['subject_id' => $subjects->where('code', 'MATH')->first()?->id]);
        }
        if ($teacher2) {
            $teacher2->classes()->attach($class10A->id, ['subject_id' => $subjects->where('code', 'CHEM')->first()?->id]);
        }
        if ($teacher3) {
            $teacher3->classes()->attach($classes->where('name', 'Grade 11-A')->first()?->id, [
                'subject_id' => $subjects->where('code', 'ENG')->first()?->id,
            ]);
        }

        $this->command->info('✔  Classes and subjects seeded: 5 classes, 7 subjects');
    }
}
