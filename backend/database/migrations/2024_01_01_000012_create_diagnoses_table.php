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
        Schema::create('diagnoses', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('vehicle_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('device_fingerprint_id')->nullable()->constrained()->onDelete('set null');
            $table->enum('input_type', ['text', 'voice', 'image', 'text_image', 'voice_image'])->default('text');
            $table->text('symptoms_description')->nullable();
            $table->string('voice_file')->nullable();
            $table->integer('voice_duration')->nullable(); // in seconds
            $table->text('voice_transcription')->nullable();
            $table->string('ai_provider')->nullable();
            $table->string('ai_model')->nullable();
            $table->text('ai_diagnosis')->nullable();
            $table->json('ai_possible_causes')->nullable();
            $table->json('ai_recommended_actions')->nullable();
            $table->enum('ai_urgency_level', ['low', 'medium', 'high', 'critical'])->nullable();
            $table->decimal('ai_confidence_score', 5, 2)->nullable();
            $table->json('ai_full_response')->nullable();
            $table->enum('status', ['pending', 'processing', 'completed', 'failed'])->default('pending');
            $table->text('error_message')->nullable();
            $table->boolean('is_free')->default(false);
            $table->boolean('expert_contact_unlocked')->default(false);
            $table->foreignId('region_id')->nullable()->constrained()->onDelete('set null');
            $table->timestamps();
            $table->softDeletes();
        });

        // Diagnosis images (multiple images per diagnosis)
        Schema::create('diagnosis_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('diagnosis_id')->constrained()->onDelete('cascade');
            $table->string('file_path');
            $table->string('file_name');
            $table->string('file_type');
            $table->integer('file_size');
            $table->string('thumbnail_path')->nullable();
            $table->text('ai_analysis')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('diagnosis_images');
        Schema::dropIfExists('diagnoses');
    }
};
