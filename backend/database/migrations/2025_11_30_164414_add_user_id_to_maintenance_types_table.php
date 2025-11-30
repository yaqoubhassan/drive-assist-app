<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Adds user_id to maintenance_types table to support custom maintenance types.
     * - NULL user_id = system-defined type (cannot be edited/deleted by users)
     * - Set user_id = user-created type (can be edited/deleted by the owner)
     */
    public function up(): void
    {
        Schema::table('maintenance_types', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('id')->constrained()->onDelete('cascade');
            $table->index(['user_id', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('maintenance_types', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropIndex(['user_id', 'is_active']);
            $table->dropColumn('user_id');
        });
    }
};
