<?php

namespace App\Services;

use App\Models\ParentProfile;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserService
{
    /**
     * Create a user and its role-specific profile in a single transaction.
     */
    public function createUser(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $user = User::create([
                'name'     => $data['name'],
                'email'    => $data['email'],
                'password' => Hash::make($data['password']),
                'role'     => $data['role'],
                'phone'    => $data['phone'] ?? null,
            ]);

            // Create the role-specific profile record
            match ($user->role) {
                'teacher' => Teacher::create(['user_id' => $user->id]),
                'student' => Student::create(['user_id' => $user->id]),
                'parent'  => ParentProfile::create(['user_id' => $user->id]),
                default   => null,
            };

            return $user;
        });
    }
}
