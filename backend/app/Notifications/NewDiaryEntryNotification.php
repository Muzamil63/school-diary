<?php

namespace App\Notifications;

use App\Models\DiaryEntry;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewDiaryEntryNotification extends Notification
{
    use Queueable;

    public function __construct(private readonly DiaryEntry $entry) {}

    /**
     * Deliver via database channel (in-app) and optionally email.
     */
    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $typeLabels = [
            'homework'     => 'New Homework',
            'announcement' => 'New Announcement',
            'remark'       => 'Teacher Remark',
        ];

        return (new MailMessage)
            ->subject($typeLabels[$this->entry->type] . ': ' . $this->entry->title)
            ->greeting("Hello {$notifiable->name}!")
            ->line($typeLabels[$this->entry->type] . ' has been posted.')
            ->line("**{$this->entry->title}**")
            ->line($this->entry->description)
            ->action('View in School Diary', config('app.frontend_url', 'http://localhost:3000'))
            ->line('Thank you for using School Diary System.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'entry_id'    => $this->entry->id,
            'type'        => $this->entry->type,
            'title'       => $this->entry->title,
            'description' => $this->entry->description,
            'teacher'     => $this->entry->teacher?->name,
            'class'       => $this->entry->class?->name,
        ];
    }
}
