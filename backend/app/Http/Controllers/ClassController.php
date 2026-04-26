<?php

namespace App\Http\Controllers;

use App\Models\SchoolClass;
use App\Models\Subject;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClassController extends Controller
{
    /**
     * List all classes with student count.
     */
    public function index(Request $request): JsonResponse
    {
        $classes = SchoolClass::withCount('students')
            ->orderBy('name')
            ->get();

        return response()->json(['data' => $classes]);
    }

    /**
     * Show a class with its students.
     */
    public function show(SchoolClass $class): JsonResponse
    {
        $class->load(['students.user:id,name,email', 'teachers.user:id,name']);

        return response()->json(['data' => $class]);
    }

    /**
     * Create a new class (admin only).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'          => ['required', 'string', 'max:100'],
            'section'       => ['nullable', 'string', 'max:10'],
            'academic_year' => ['nullable', 'string', 'max:20'],
        ]);

        $class = SchoolClass::create($validated);

        return response()->json(['message' => 'Class created.', 'data' => $class], 201);
    }

    /**
     * Update a class.
     */
    public function update(Request $request, SchoolClass $class): JsonResponse
    {
        $validated = $request->validate([
            'name'          => ['sometimes', 'required', 'string', 'max:100'],
            'section'       => ['nullable', 'string', 'max:10'],
            'academic_year' => ['nullable', 'string', 'max:20'],
        ]);

        $class->update($validated);

        return response()->json(['message' => 'Class updated.', 'data' => $class]);
    }

    /**
     * Delete a class.
     */
    public function destroy(SchoolClass $class): JsonResponse
    {
        $class->delete();

        return response()->json(['message' => 'Class deleted.']);
    }

    /**
     * Get students in a specific class.
     */
    public function students(SchoolClass $class): JsonResponse
    {
        $students = $class->students()->with('user:id,name,email')->get();

        return response()->json(['data' => $students]);
    }

    // ─── Subject endpoints ────────────────────────────────────────────────────

    public function subjectIndex(): JsonResponse
    {
        return response()->json(['data' => Subject::orderBy('name')->get()]);
    }

    public function subjectStore(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'        => ['required', 'string', 'max:100'],
            'code'        => ['nullable', 'string', 'max:20', 'unique:subjects,code'],
            'description' => ['nullable', 'string'],
        ]);

        $subject = Subject::create($validated);

        return response()->json(['message' => 'Subject created.', 'data' => $subject], 201);
    }

    public function subjectUpdate(Request $request, Subject $subject): JsonResponse
    {
        $validated = $request->validate([
            'name'        => ['sometimes', 'required', 'string', 'max:100'],
            'code'        => ['nullable', 'string', 'max:20'],
            'description' => ['nullable', 'string'],
        ]);

        $subject->update($validated);

        return response()->json(['message' => 'Subject updated.', 'data' => $subject]);
    }

    public function subjectDestroy(Subject $subject): JsonResponse
    {
        $subject->delete();

        return response()->json(['message' => 'Subject deleted.']);
    }
}
