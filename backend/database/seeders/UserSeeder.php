<?php

namespace Database\Seeders;

use App\Models\ParentProfile;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // ── Admin ──────────────────────────────────────────────────────────
        User::create([
            'name'     => 'Dr. Sarah Mitchell',
            'email'    => 'admin@school.edu',
            'password' => Hash::make('admin123'),
            'role'     => 'admin',
        ]);

        // ── Teachers ────────────────────────────────────────────────────────
        $teacher1 = User::create([
            'name'     => 'James Anderson',
            'email'    => 'j.anderson@school.edu',
            'password' => Hash::make('teacher123'),
            'role'     => 'teacher',
        ]);
        Teacher::create(['user_id' => $teacher1->id, 'employee_id' => 'TCH-001']);

        $teacher2 = User::create([
            'name'     => 'Emily Carter',
            'email'    => 'e.carter@school.edu',
            'password' => Hash::make('teacher123'),
            'role'     => 'teacher',
        ]);
        Teacher::create(['user_id' => $teacher2->id, 'employee_id' => 'TCH-002']);

        $teacher3 = User::create([
            'name'     => 'Olivia Taylor',
            'email'    => 'o.taylor@school.edu',
            'password' => Hash::make('teacher123'),
            'role'     => 'teacher',
        ]);
        Teacher::create(['user_id' => $teacher3->id, 'employee_id' => 'TCH-003']);

        // ── Students ────────────────────────────────────────────────────────
        $student1 = User::create([
            'name'     => 'Michael Brown',
            'email'    => 'e.brown@school.edu',
            'password' => Hash::make('student123'),
            'role'     => 'student',
        ]);
        Student::create([
            'user_id'          => $student1->id,
            'roll_number'      => 'STU-001',
            'admission_number' => 'ADM-2024-001',
        ]);

        $student2 = User::create([
            'name'     => 'Sophia Williams',
            'email'    => 's.williams@school.edu',
            'password' => Hash::make('student123'),
            'role'     => 'student',
        ]);
        Student::create([
            'user_id'          => $student2->id,
            'roll_number'      => 'STU-002',
            'admission_number' => 'ADM-2024-002',
        ]);

        // ── Parents ─────────────────────────────────────────────────────────
        $parent1 = User::create([
            'name'     => 'Robert Brown',
            'email'    => 'r.brown@parent.com',
            'password' => Hash::make('parent123'),
            'role'     => 'parent',
        ]);
        $parentProfile1 = ParentProfile::create([
            'user_id'      => $parent1->id,
            'relationship' => 'father',
        ]);

        $parent2 = User::create([
            'name'     => 'Linda Williams',
            'email'    => 'l.williams@parent.com',
            'password' => Hash::make('parent123'),
            'role'     => 'parent',
        ]);
        $parentProfile2 = ParentProfile::create([
            'user_id'      => $parent2->id,
            'relationship' => 'mother',
        ]);

        // Assign children to parents
        $studentProfile1 = Student::where('user_id', $student1->id)->first();
        $studentProfile2 = Student::where('user_id', $student2->id)->first();

        $parentProfile1->students()->attach($studentProfile1->id);
        $parentProfile2->students()->attach($studentProfile2->id);

        $this->command->info('✔  Users seeded: 1 admin, 3 teachers, 2 students, 2 parents');
    }
}
