<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('diary_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')->constrained('users')->cascadeOnDelete();
            $table->enum('type', ['homework', 'announcement', 'remark']);
            $table->string('title');
            $table->text('description');
            $table->foreignId('class_id')->nullable()->constrained('classes')->nullOnDelete();
            $table->foreignId('subject_id')->nullable()->constrained('subjects')->nullOnDelete();

            // Only populated for 'remark' type entries
            $table->foreignId('student_id')->nullable()->constrained('users')->nullOnDelete();

            $table->date('due_date')->nullable()->comment('Used for homework due date');

            // Optimistic locking for concurrent edit detection
            $table->unsignedBigInteger('version')->default(1);

            // Processing status for queued operations
            $table->enum('status', ['pending', 'published', 'failed'])->default('published');

            $table->timestamps();
            $table->softDeletes();

            // Performance indexes
            $table->index('type');
            $table->index('teacher_id');
            $table->index('class_id');
            $table->index('student_id');
            $table->index('due_date');
            $table->index(['type', 'class_id']);
            $table->index(['teacher_id', 'type']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('diary_entries');
    }
};
