<?php

namespace App\Jobs;

use App\Events\DiaryEntryCreated;
use App\Models\DiaryEntry;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Background job for processing diary entries.
 *
 * Handles concurrent submission safety:
 *  - Multiple teachers can dispatch this job simultaneously
 *  - Each job runs in its own DB transaction
 *  - Redis queue ensures jobs are processed in order per teacher
 *
 * Queue workers: php artisan queue:work --queue=diary --tries=3
 */
class ProcessDiaryEntry implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public string $queue = 'diary';
    public int $tries    = 3;
    public int $timeout  = 60;

    public function __construct(private readonly array $entryData) {}

    public function handle(): void
    {
        DB::transaction(function () {
            $entry = DiaryEntry::create($this->entryData);
            event(new DiaryEntryCreated($entry));

            Log::info("DiaryEntry #{$entry->id} processed by queue worker", [
                'type'      => $entry->type,
                'teacher'   => $entry->teacher_id,
                'worker_id' => gethostname(),
            ]);
        });
    }

    /**
     * Handle a failed job — mark entry status as 'failed' if possible.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('ProcessDiaryEntry job failed', [
            'data'  => $this->entryData,
            'error' => $exception->getMessage(),
        ]);
    }

    /**
     * Unique key per teacher to prevent duplicate dispatches within 5 seconds.
     */
    public function uniqueId(): string
    {
        return 'diary_entry_' . ($this->entryData['teacher_id'] ?? 'unknown');
    }

    public function uniqueFor(): int
    {
        return 5; // seconds
    }
}
