<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClassController;
use App\Http\Controllers\DiaryController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes  —  /api prefix is applied by bootstrap/app.php
|--------------------------------------------------------------------------
|
| All routes here are stateless and protected by Laravel Sanctum tokens.
| Role-based access is enforced via the 'role' middleware.
|
*/

// ── Public: Authentication ─────────────────────────────────────────────────
Route::prefix('auth')->middleware('throttle:auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
});

// ── Protected: Require valid Sanctum token ─────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::prefix('auth')->group(function () {
        Route::get('/profile',         [AuthController::class, 'profile']);
        Route::post('/logout',         [AuthController::class, 'logout']);
        Route::post('/change-password',[AuthController::class, 'changePassword']);
    });

    // ── Diary Entries ──────────────────────────────────────────────────────
    Route::prefix('diary')->group(function () {
        Route::get('/',    [DiaryController::class, 'index']);
        Route::get('/{diaryEntry}', [DiaryController::class, 'show']);

        // Only teachers and admins can create/edit/delete
        Route::middleware('role:admin,teacher')->group(function () {
            Route::post('/',                [DiaryController::class, 'store']);
            Route::put('/{diaryEntry}',     [DiaryController::class, 'update']);
            Route::delete('/{diaryEntry}',  [DiaryController::class, 'destroy']);
        });
    });

    // ── Users ──────────────────────────────────────────────────────────────
    Route::prefix('users')->group(function () {
        // Lookup endpoints available to teachers too (for dropdowns)
        Route::get('/students', [UserController::class, 'students']);
        Route::get('/teachers', [UserController::class, 'teachers']);

        // Admin-only user management
        Route::middleware('role:admin')->group(function () {
            Route::get('/',                                        [UserController::class, 'index']);
            Route::post('/',                                       [UserController::class, 'store']);
            Route::put('/{user}',                                  [UserController::class, 'update']);
            Route::delete('/{user}',                               [UserController::class, 'destroy']);
            Route::post('/parents/{parent}/students',              [UserController::class, 'assignStudentToParent']);
            Route::delete('/parents/{parent}/students/{student}',  [UserController::class, 'removeStudentFromParent']);
            Route::get('/activity-logs',                           [UserController::class, 'activityLogs']);
        });
    });

    // ── Classes & Subjects ─────────────────────────────────────────────────
    Route::prefix('classes')->group(function () {
        Route::get('/',                     [ClassController::class, 'index']);
        Route::get('/{class}',              [ClassController::class, 'show']);
        Route::get('/{class}/students',     [ClassController::class, 'students']);

        Route::middleware('role:admin')->group(function () {
            Route::post('/',           [ClassController::class, 'store']);
            Route::put('/{class}',     [ClassController::class, 'update']);
            Route::delete('/{class}',  [ClassController::class, 'destroy']);
        });
    });

    Route::prefix('subjects')->group(function () {
        Route::get('/',              [ClassController::class, 'subjectIndex']);
        Route::middleware('role:admin')->group(function () {
            Route::post('/',            [ClassController::class, 'subjectStore']);
            Route::put('/{subject}',    [ClassController::class, 'subjectUpdate']);
            Route::delete('/{subject}', [ClassController::class, 'subjectDestroy']);
        });
    });
});
