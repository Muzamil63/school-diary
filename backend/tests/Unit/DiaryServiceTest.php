<?php

namespace Tests\Unit;

use App\Models\DiaryEntry;
use App\Models\User;
use App\Services\DiaryService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Event;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;
use Tests\TestCase;

class DiaryServiceTest extends TestCase
{
    use RefreshDatabase;

    private DiaryService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new DiaryService();
        Event::fake();
    }

    /** @test */
    public function it_creates_a_diary_entry_and_fires_event(): void
    {
        $teacher = User::factory()->create(['role' => 'teacher']);

        Cache::shouldReceive('lock')->andReturnSelf();
        Cache::shouldReceive('block')->andReturnUsing(fn($t, $cb) => $cb());

        $entry = $this->service->create([
            'teacher_id'  => $teacher->id,
            'type'        => 'homework',
            'title'       => 'Test Homework',
            'description' => 'Complete exercises 1–10',
            'status'      => 'published',
        ]);

        $this->assertDatabaseHas('diary_entries', ['title' => 'Test Homework']);
        Event::assertDispatched(\App\Events\DiaryEntryCreated::class);
    }

    /** @test */
    public function it_increments_version_on_update(): void
    {
        $teacher = User::factory()->create(['role' => 'teacher']);
        $entry   = DiaryEntry::factory()->create(['teacher_id' => $teacher->id, 'version' => 1]);

        $updated = $this->service->update($entry, ['title' => 'Updated Title'], 1);

        $this->assertEquals(2, $updated->version);
        $this->assertEquals('Updated Title', $updated->title);
    }

    /** @test */
    public function it_throws_conflict_when_version_mismatch(): void
    {
        $this->expectException(ConflictHttpException::class);

        $teacher = User::factory()->create(['role' => 'teacher']);
        $entry   = DiaryEntry::factory()->create(['teacher_id' => $teacher->id, 'version' => 3]);

        // Client sends stale version 1, server is at version 3 → conflict
        $this->service->update($entry, ['title' => 'Stale Update'], 1);
    }

    /** @test */
    public function it_soft_deletes_an_entry(): void
    {
        $teacher = User::factory()->create(['role' => 'teacher']);
        $entry   = DiaryEntry::factory()->create(['teacher_id' => $teacher->id]);

        $this->service->delete($entry);

        $this->assertSoftDeleted('diary_entries', ['id' => $entry->id]);
    }
}
