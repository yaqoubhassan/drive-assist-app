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
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('vehicle_make_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('vehicle_model_id')->nullable()->constrained()->onDelete('set null');
            $table->string('custom_make')->nullable(); // For makes not in our list
            $table->string('custom_model')->nullable(); // For models not in our list
            $table->year('year')->nullable();
            $table->string('color')->nullable();
            $table->string('license_plate')->nullable();
            $table->string('vin')->nullable();
            $table->enum('fuel_type', ['petrol', 'diesel', 'electric', 'hybrid', 'lpg', 'other'])->nullable();
            $table->enum('transmission', ['manual', 'automatic', 'cvt', 'other'])->nullable();
            $table->integer('mileage')->nullable();
            $table->enum('mileage_unit', ['km', 'miles'])->default('km');
            $table->string('nickname')->nullable();
            $table->string('image')->nullable();
            $table->boolean('is_primary')->default(false);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};
