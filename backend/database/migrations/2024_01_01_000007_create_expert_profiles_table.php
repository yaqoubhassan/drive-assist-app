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
        Schema::create('expert_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('business_name')->nullable();
            $table->text('bio')->nullable();
            $table->integer('experience_years')->default(0);
            $table->foreignId('region_id')->nullable()->constrained()->onDelete('set null');
            $table->string('city')->nullable();
            $table->string('address')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->string('whatsapp_number')->nullable();
            $table->string('alternate_phone')->nullable();
            $table->enum('kyc_status', ['pending', 'submitted', 'approved', 'rejected'])->default('pending');
            $table->timestamp('kyc_submitted_at')->nullable();
            $table->timestamp('kyc_approved_at')->nullable();
            $table->text('kyc_rejection_reason')->nullable();
            $table->integer('free_leads_remaining')->default(4);
            $table->integer('total_leads_received')->default(0);
            $table->decimal('rating', 3, 2)->default(0);
            $table->integer('rating_count')->default(0);
            $table->integer('jobs_completed')->default(0);
            $table->boolean('is_priority_listed')->default(false);
            $table->boolean('is_available')->default(true);
            $table->json('working_hours')->nullable();
            $table->timestamps();
        });

        // Pivot table for expert specializations
        Schema::create('expert_specializations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('expert_profile_id')->constrained()->onDelete('cascade');
            $table->foreignId('specialization_id')->constrained()->onDelete('cascade');
            $table->timestamps();

            $table->unique(['expert_profile_id', 'specialization_id']);
        });

        // Pivot table for expert service regions
        Schema::create('expert_regions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('expert_profile_id')->constrained()->onDelete('cascade');
            $table->foreignId('region_id')->constrained()->onDelete('cascade');
            $table->timestamps();

            $table->unique(['expert_profile_id', 'region_id']);
        });

        // Pivot table for vehicle makes expert specializes in
        Schema::create('expert_vehicle_makes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('expert_profile_id')->constrained()->onDelete('cascade');
            $table->foreignId('vehicle_make_id')->constrained()->onDelete('cascade');
            $table->timestamps();

            $table->unique(['expert_profile_id', 'vehicle_make_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('expert_vehicle_makes');
        Schema::dropIfExists('expert_regions');
        Schema::dropIfExists('expert_specializations');
        Schema::dropIfExists('expert_profiles');
    }
};
