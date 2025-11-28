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
        Schema::create('driver_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('region_id')->nullable()->constrained()->onDelete('set null');
            $table->string('city')->nullable();
            $table->string('license_number')->nullable();
            $table->date('license_expiry')->nullable();
            $table->integer('driving_experience_years')->default(0);
            $table->integer('free_diagnoses_remaining')->default(5);
            $table->integer('paid_diagnoses_remaining')->default(0);
            $table->integer('total_diagnoses_used')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('driver_profiles');
    }
};
