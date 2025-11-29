<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('video_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('icon')->nullable();
            $table->string('color')->default('#3B82F6');
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('video_resources', function (Blueprint $table) {
            $table->id();
            $table->foreignId('video_category_id')->constrained('video_categories')->onDelete('cascade');
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('youtube_id'); // The YouTube video ID (e.g., dQw4w9WgXcQ)
            $table->string('youtube_url'); // Full YouTube URL
            $table->string('thumbnail_url')->nullable(); // YouTube thumbnail
            $table->string('channel_name')->nullable();
            $table->string('channel_url')->nullable();
            $table->integer('duration_seconds')->nullable(); // Video duration in seconds
            $table->string('duration_formatted')->nullable(); // e.g., "10:30"
            $table->integer('views_count')->default(0); // Our app views
            $table->integer('likes_count')->default(0);
            $table->integer('sort_order')->default(0);
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_published')->default(true);
            $table->timestamps();

            $table->index(['video_category_id', 'is_published']);
            $table->index('is_featured');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('video_resources');
        Schema::dropIfExists('video_categories');
    }
};
