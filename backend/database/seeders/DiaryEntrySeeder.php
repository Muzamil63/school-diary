<?php

namespace Database\Seeders;

use App\Models\DiaryEntry;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Database\Seeder;

class DiaryEntrySeeder extends Seeder
{
    public function run(): void
    {
        $teacher1 = User::where('email', 'j.anderson@school.edu')->first();
        $teacher2 = User::where('email', 'e.carter@school.edu')->first();
        $teacher3 = User::where('email', 'o.taylor@school.edu')->first();

        $class10A  = SchoolClass::where('name', 'Grade 10-A')->first();
        $class10B  = SchoolClass::where('name', 'Grade 10-B')->first();
        $class11A  = SchoolClass::where('name', 'Grade 11-A')->first();

        $math    = Subject::where('code', 'MATH')->first();
        $chem    = Subject::where('code', 'CHEM')->first();
        $eng     = Subject::where('code', 'ENG')->first();
        $sci     = Subject::where('code', 'SCI')->first();

        $student1 = User::where('email', 'e.brown@school.edu')->first();
        $student2 = User::where('email', 's.williams@school.edu')->first();

        $entries = [
            [
                'teacher_id'  => $teacher1->id,
                'type'        => 'homework',
                'title'       => 'Chapter 7: Quadratic Equations Homework',
                'description' => 'Complete exercises 7.1 to 7.5 from the textbook. Show all working steps. Due by Friday.',
                'class_id'    => $class10A->id,
                'subject_id'  => $math->id,
                'due_date'    => now()->addDays(4)->toDateString(),
            ],
            [
                'teacher_id'  => $teacher1->id,
                'type'        => 'announcement',
                'title'       => 'Parent-Teacher Meeting – December 10',
                'description' => 'Annual parent-teacher meeting scheduled for December 10th at 3:00 PM in the school auditorium. Please ensure parents are notified.',
                'class_id'    => null,
                'subject_id'  => null,
            ],
            [
                'teacher_id'  => $teacher2->id,
                'type'        => 'remark',
                'title'       => 'Outstanding Performance in Chemistry Lab',
                'description' => 'Michael has shown exceptional understanding during chemistry lab sessions. His experimental methodology is commendable.',
                'class_id'    => $class10A->id,
                'subject_id'  => $chem->id,
                'student_id'  => $student1->id,
            ],
            [
                'teacher_id'  => $teacher2->id,
                'type'        => 'homework',
                'title'       => 'Science Project Proposal Submission',
                'description' => 'All students must submit science fair project proposals by December 8th. Topics must be drawn from Chapters 5–8.',
                'class_id'    => $class10B->id,
                'subject_id'  => $sci->id,
                'due_date'    => now()->addDays(6)->toDateString(),
            ],
            [
                'teacher_id'  => $teacher3->id,
                'type'        => 'announcement',
                'title'       => 'Annual Sports Day – December 15',
                'description' => 'Sports day will be held on December 15th. Students should arrive in sports attire. Events: 100m sprint, long jump, relay race.',
                'class_id'    => null,
                'subject_id'  => null,
            ],
            [
                'teacher_id'  => $teacher3->id,
                'type'        => 'homework',
                'title'       => 'English Essay – Impact of Technology on Education',
                'description' => 'Write a 500-word essay on "The Impact of Technology on Modern Education". Include bibliography. Submit via the school portal.',
                'class_id'    => $class11A->id,
                'subject_id'  => $eng->id,
                'due_date'    => now()->addDays(8)->toDateString(),
            ],
            [
                'teacher_id'  => $teacher3->id,
                'type'        => 'remark',
                'title'       => 'Needs Improvement in Class Participation',
                'description' => 'Sophia has strong knowledge but hesitates to participate in class discussions. Encourage her to engage more actively.',
                'class_id'    => $class10A->id,
                'subject_id'  => $eng->id,
                'student_id'  => $student2->id,
            ],
            [
                'teacher_id'  => $teacher1->id,
                'type'        => 'announcement',
                'title'       => 'Mid-Term Examination Schedule',
                'description' => 'Mid-term exams begin January 15th. Schedule: Maths (Jan 15), Science (Jan 16), English (Jan 17), History (Jan 18). All from 9:00 AM–12:00 PM.',
                'class_id'    => null,
                'subject_id'  => null,
            ],
        ];

        foreach ($entries as $entry) {
            DiaryEntry::create(array_merge($entry, ['status' => 'published']));
        }

        $this->command->info('✔  Diary entries seeded: 8 entries (3 homework, 3 announcements, 2 remarks)');
    }
}
