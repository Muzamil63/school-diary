<?php

namespace Tests\Feature;

use App\Models\DiaryEntry;
use App\Models\SchoolClass;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

class DiaryTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function teacher_can_create_a_diary_entry(): void
    {
        Event::fake();

        $teacher = User::factory()->create(['role' => 'teacher']);
        $class   = SchoolClass::factory()->create();

        $this->actingAs($teacher, 'sanctum')
             ->postJson('/api/diary', [
                 'type'        => 'homework',
                 'title'       => 'Math Homework',
                 'description' => 'Solve problems 1 to 20',
                 'class_id'    => $class->id,
                 'due_date'    => now()->addDays(3)->toDateString(),
             ])
             ->assertCreated()
             ->assertJsonPath('data.type', 'homework')
             ->assertJsonPath('data.title', 'Math Homework');
    }

    /** @test */
    public function student_cannot_create_diary_entry(): void
    {
        $student = User::factory()->create(['role' => 'student']);

        $this->actingAs($student, 'sanctum')
             ->postJson('/api/diary', [
                 'type'        => 'homework',
                 'title'       => 'Unauthorized',
                 'description' => 'This should fail',
             ])
             ->assertForbidden();
    }

    /** @test */
    public function teacher_can_only_update_own_entries(): void
    {
        $teacher1 = User::factory()->create(['role' => 'teacher']);
        $teacher2 = User::factory()->create(['role' => 'teacher']);

        $entry = DiaryEntry::factory()->create(['teacher_id' => $teacher1->id]);

        // Teacher 2 tries to update Teacher 1's entry
        $this->actingAs($teacher2, 'sanctum')
             ->putJson("/api/diary/{$entry->id}", ['title' => 'Hijacked'])
             ->assertForbidden();
    }

    /** @test */
    public function teacher_can_delete_own_entry(): void
    {
        $teacher = User::factory()->create(['role' => 'teacher']);
        $entry   = DiaryEntry::factory()->create(['teacher_id' => $teacher->id]);

        $this->actingAs($teacher, 'sanctum')
             ->deleteJson("/api/diary/{$entry->id}")
             ->assertOk();

        $this->assertSoftDeleted('diary_entries', ['id' => $entry->id]);
    }

    /** @test */
    public function admin_can_see_all_diary_entries(): void
    {
        Event::fake();

        $admin    = User::factory()->create(['role' => 'admin']);
        $teacher1 = User::factory()->create(['role' => 'teacher']);
        $teacher2 = User::factory()->create(['role' => 'teacher']);

        DiaryEntry::factory()->count(3)->create(['teacher_id' => $teacher1->id, 'status' => 'published']);
        DiaryEntry::factory()->count(2)->create(['teacher_id' => $teacher2->id, 'status' => 'published']);

        $response = $this->actingAs($admin, 'sanctum')
                         ->getJson('/api/diary')
                         ->assertOk();

        $this->assertEquals(5, $response->json('total'));
    }

    /** @test */
    public function remark_entry_requires_student_id(): void
    {
        $teacher = User::factory()->create(['role' => 'teacher']);

        $this->actingAs($teacher, 'sanctum')
             ->postJson('/api/diary', [
                 'type'        => 'remark',
                 'title'       => 'Good Student',
                 'description' => 'Excellent work',
                 // student_id intentionally missing
             ])
             ->assertStatus(422)
             ->assertJsonValidationErrors('student_id');
    }
}
