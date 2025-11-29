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
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('driver_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('expert_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('diagnosis_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('vehicle_id')->nullable()->constrained()->onDelete('set null');

            // Scheduling
            $table->date('scheduled_date');
            $table->time('scheduled_time');
            $table->integer('estimated_duration_minutes')->default(60);

            // Service details
            $table->string('service_type'); // diagnostic, repair, maintenance, inspection
            $table->text('description')->nullable();
            $table->text('notes')->nullable();

            // Location - can be expert's shop or driver's location
            $table->enum('location_type', ['expert_shop', 'driver_location'])->default('expert_shop');
            $table->string('address')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();

            // Status workflow
            $table->enum('status', [
                'pending',      // Awaiting expert confirmation
                'confirmed',    // Expert accepted
                'in_progress',  // Service started
                'completed',    // Service finished
                'cancelled',    // Cancelled by either party
                'no_show',      // Driver didn't show up
                'rejected',     // Expert rejected
            ])->default('pending');

            // Pricing
            $table->decimal('estimated_cost', 10, 2)->nullable();
            $table->decimal('final_cost', 10, 2)->nullable();
            $table->string('currency', 3)->default('GHS');

            // Payment
            $table->enum('payment_status', [
                'pending',
                'paid',
                'partial',
                'refunded',
            ])->default('pending');
            $table->string('payment_method')->nullable(); // mobile_money, cash, card

            // Timestamps for workflow
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->string('cancellation_reason')->nullable();
            $table->string('cancelled_by')->nullable(); // driver, expert

            $table->timestamps();

            // Indexes for common queries
            $table->index(['driver_id', 'status']);
            $table->index(['expert_id', 'status']);
            $table->index(['scheduled_date', 'status']);
        });

        // Service packages that experts can offer
        Schema::create('service_packages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('expert_id')->constrained('users')->onDelete('cascade');
            $table->string('name');
            $table->string('slug');
            $table->text('description')->nullable();
            $table->string('category'); // diagnostic, repair, maintenance, inspection
            $table->decimal('price', 10, 2);
            $table->decimal('price_max', 10, 2)->nullable(); // For price ranges
            $table->string('currency', 3)->default('GHS');
            $table->integer('duration_minutes')->default(60);
            $table->json('includes')->nullable(); // List of what's included
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->unique(['expert_id', 'slug']);
        });

        // Link appointments to service packages
        Schema::create('appointment_services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('appointment_id')->constrained()->onDelete('cascade');
            $table->foreignId('service_package_id')->nullable()->constrained()->onDelete('set null');
            $table->string('service_name'); // Copy of name in case package deleted
            $table->decimal('price', 10, 2);
            $table->integer('quantity')->default(1);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appointment_services');
        Schema::dropIfExists('service_packages');
        Schema::dropIfExists('appointments');
    }
};
