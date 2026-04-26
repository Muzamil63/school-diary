<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class ActivityLogService
{
    /**
     * Record a user action in the activity log.
     *
     * @param User        $user      The actor
     * @param string      $action    Human-readable action label
     * @param Model|null  $model     The affected Eloquent model (optional)
     * @param array       $oldValues Values before the change (optional)
     * @param array       $newValues Values after the change (optional)
     */
    public function log(
        User $user,
        string $action,
        ?Model $model = null,
        array $oldValues = [],
        array $newValues = []
    ): void {
        ActivityLog::create([
            'user_id'    => $user->id,
            'action'     => $action,
            'model_type' => $model ? get_class($model) : null,
            'model_id'   => $model?->getKey(),
            'old_values' => $oldValues ?: null,
            'new_values' => $newValues ?: null,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }
}
