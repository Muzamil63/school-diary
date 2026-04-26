<?php

namespace App\Http\Controllers;

use App\Http\Requests\DiaryEntryRequest;
use App\Jobs\ProcessDiaryEntry;
use App\Models\DiaryEntry;
use App\Services\DiaryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class DiaryController extends Controller
{
    public function __construct(private DiaryService $diaryService) {}

    /**
     * List diary entries with filters and pagination.
     * Role-based visibility is enforced in DiaryService.
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'type'       => ['nullable', 'in:homework,announcement,remark'],
            'class_id'   => ['nullable', 'integer'],
            'subject_id' => ['nullable', 'integer'],
            'date_from'  => ['nullable', 'date'],
            'date_to'    => ['nullable', 'date'],
            'search'     => ['nullable', 'string', 'max:100'],
            'per_page'   => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        $entries = $this->diaryService->getEntriesForUser(
            $request->user(),
            $request->only(['type', 'class_id', 'subject_id', 'date_from', 'date_to', 'search']),
            $request->integer('per_page', 10)
        );

        return response()->json($entries);
    }

    /**
     * Create a new diary entry via a queued job (handles concurrency).
     */
    public function store(DiaryEntryRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $validated['teacher_id'] = $request->user()->id;

        // Dispatch to queue for concurrent processing with a unique lock per teacher
        $entry = $this->diaryService->create($validated);

        return response()->json([
            'message' => 'Diary entry created successfully.',
            'data'    => $this->diaryService->formatEntry($entry->load(['teacher', 'class', 'subject', 'student'])),
        ], 201);
    }

    /**
     * Show a single diary entry.
     */
    public function show(DiaryEntry $diaryEntry): JsonResponse
    {
        Gate::authorize('view', $diaryEntry);

        return response()->json([
            'data' => $this->diaryService->formatEntry(
                $diaryEntry->load(['teacher', 'class', 'subject', 'student'])
            ),
        ]);
    }

    /**
     * Update an entry with optimistic locking to handle concurrent edits.
     */
    public function update(DiaryEntryRequest $request, DiaryEntry $diaryEntry): JsonResponse
    {
        Gate::authorize('update', $diaryEntry);

        $entry = $this->diaryService->update($diaryEntry, $request->validated(), $request->input('version'));

        return response()->json([
            'message' => 'Diary entry updated successfully.',
            'data'    => $this->diaryService->formatEntry($entry->load(['teacher', 'class', 'subject', 'student'])),
        ]);
    }

    /**
     * Soft-delete an entry.
     */
    public function destroy(DiaryEntry $diaryEntry): JsonResponse
    {
        Gate::authorize('delete', $diaryEntry);

        $this->diaryService->delete($diaryEntry);

        return response()->json(['message' => 'Diary entry deleted successfully.']);
    }
}
