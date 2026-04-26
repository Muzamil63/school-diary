<?php

namespace App\Http\Controllers;

use App\Models\ParentProfile;
use App\Models\Student;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UserController extends Controller
{
    public function __construct(private UserService $userService) {}

    /**
     * Paginated list of users (admin only).
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'role'     => ['nullable', 'in:admin,teacher,student,parent'],
            'search'   => ['nullable', 'string', 'max:100'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        $users = User::query()
            ->when($request->role, fn($q) => $q->where('role', $request->role))
            ->when($request->search, fn($q) => $q->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%");
            }))
            ->orderBy('created_at', 'desc')
            ->paginate($request->integer('per_page', 15));

        return response()->json($users);
    }

    /**
     * Get all students (for dropdowns).
     */
    public function students(Request $request): JsonResponse
    {
        $students = User::where('role', 'student')
            ->where('status', 'active')
            ->with('student.class')
            ->get(['id', 'name', 'email']);

        return response()->json(['data' => $students]);
    }

    /**
     * Get all teachers.
     */
    public function teachers(Request $request): JsonResponse
    {
        $teachers = User::where('role', 'teacher')
            ->where('status', 'active')
            ->get(['id', 'name', 'email']);

        return response()->json(['data' => $teachers]);
    }

    /**
     * Create a new user account (admin only).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'email', 'unique:users,email'],
            'password' => ['required', Password::min(8)],
            'role'     => ['required', 'in:admin,teacher,student,parent'],
            'phone'    => ['nullable', 'string', 'max:20'],
        ]);

        $user = $this->userService->createUser($validated);

        return response()->json([
            'message' => 'User created successfully.',
            'data'    => $user,
        ], 201);
    }

    /**
     * Update an existing user.
     */
    public function update(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'name'     => ['sometimes', 'required', 'string', 'max:255'],
            'email'    => ['sometimes', 'required', 'email', Rule::unique('users')->ignore($user->id)],
            'password' => ['nullable', Password::min(8)],
            'status'   => ['nullable', 'in:active,inactive'],
            'phone'    => ['nullable', 'string', 'max:20'],
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return response()->json([
            'message' => 'User updated successfully.',
            'data'    => $user,
        ]);
    }

    /**
     * Delete a user (soft-delete).
     */
    public function destroy(User $user): JsonResponse
    {
        // Prevent self-deletion
        if ($user->id === request()->user()->id) {
            return response()->json(['message' => 'You cannot delete your own account.'], 403);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted successfully.']);
    }

    /**
     * Assign a student to a parent.
     */
    public function assignStudentToParent(Request $request, User $parent): JsonResponse
    {
        $request->validate(['student_id' => ['required', 'exists:users,id']]);

        $parentProfile = ParentProfile::firstOrCreate(['user_id' => $parent->id]);
        $student = Student::where('user_id', $request->student_id)->firstOrFail();

        $parentProfile->students()->syncWithoutDetaching([$student->id]);

        return response()->json(['message' => 'Student assigned to parent successfully.']);
    }

    /**
     * Remove a student from a parent.
     */
    public function removeStudentFromParent(User $parent, User $student): JsonResponse
    {
        $parentProfile = ParentProfile::where('user_id', $parent->id)->firstOrFail();
        $studentProfile = Student::where('user_id', $student->id)->firstOrFail();

        $parentProfile->students()->detach($studentProfile->id);

        return response()->json(['message' => 'Student removed from parent successfully.']);
    }

    /**
     * Activity logs (admin only).
     */
    public function activityLogs(Request $request): JsonResponse
    {
        $logs = \App\Models\ActivityLog::with('user:id,name,role')
            ->orderBy('created_at', 'desc')
            ->paginate($request->integer('per_page', 15));

        return response()->json($logs);
    }
}
