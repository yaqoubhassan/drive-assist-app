<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('quiz_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('road_sign_category_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('road_sign_id')->nullable()->constrained()->onDelete('set null');
            $table->text('question');
            $table->string('image')->nullable();
            $table->json('options'); // Array of option strings
            $table->integer('correct_answer_index'); // Index of correct option (0-based)
            $table->text('explanation')->nullable();
            $table->enum('difficulty', ['easy', 'medium', 'hard'])->default('medium');
            $table->boolean('is_active')->default(true);
            $table->integer('times_answered')->default(0);
            $table->integer('times_correct')->default(0);
            $table->timestamps();
        });

        Schema::create('quiz_attempts', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('road_sign_category_id')->nullable()->constrained()->onDelete('set null');
            $table->string('category_slug')->nullable(); // Store slug for reference even if category deleted
            $table->integer('total_questions');
            $table->integer('correct_answers');
            $table->integer('score'); // Percentage
            $table->integer('time_taken'); // In seconds
            $table->string('grade')->nullable(); // A, B, C, D, F
            $table->boolean('passed')->default(false);
            $table->json('question_results')->nullable(); // Detailed results per question
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quiz_attempts');
        Schema::dropIfExists('quiz_questions');
    }
};
