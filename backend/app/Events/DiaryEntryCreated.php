<?php

namespace App\Events;

use App\Models\DiaryEntry;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DiaryEntryCreated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public readonly DiaryEntry $entry) {}
}
