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
        Schema::create('maintenance_types', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('icon')->nullable();
            $table->string('color')->nullable();
            $table->integer('default_interval_km')->nullable(); // Default km interval
            $table->integer('default_interval_months')->nullable(); // Default months interval
            $table->boolean('is_critical')->default(false);
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('maintenance_reminders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('vehicle_id')->constrained()->onDelete('cascade');
            $table->foreignId('maintenance_type_id')->constrained()->onDelete('cascade');
            $table->string('custom_title')->nullable();
            $table->text('notes')->nullable();
            $table->date('due_date')->nullable();
            $table->integer('due_mileage')->nullable();
            $table->integer('interval_km')->nullable();
            $table->integer('interval_months')->nullable();
            $table->date('last_completed_date')->nullable();
            $table->integer('last_completed_mileage')->nullable();
            $table->decimal('last_completed_cost', 10, 2)->nullable();
            $table->string('currency')->default('GHS');
            $table->enum('status', ['upcoming', 'due', 'overdue', 'completed', 'snoozed'])->default('upcoming');
            $table->boolean('notifications_enabled')->default(true);
            $table->json('notification_days')->nullable(); // Days before to notify [7, 3, 1]
            $table->timestamp('snoozed_until')->nullable();
            $table->boolean('is_recurring')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        // Maintenance history log
        Schema::create('maintenance_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('maintenance_reminder_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('vehicle_id')->constrained()->onDelete('cascade');
            $table->foreignId('maintenance_type_id')->constrained()->onDelete('cascade');
            $table->date('completed_date');
            $table->integer('mileage_at_service')->nullable();
            $table->decimal('cost', 10, 2)->nullable();
            $table->string('currency')->default('GHS');
            $table->string('service_provider')->nullable();
            $table->text('notes')->nullable();
            $table->json('parts_replaced')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('maintenance_logs');
        Schema::dropIfExists('maintenance_reminders');
        Schema::dropIfExists('maintenance_types');
    }
};
