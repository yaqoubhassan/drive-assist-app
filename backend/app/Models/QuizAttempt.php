<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class QuizAttempt extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'user_id',
        'road_sign_category_id',
        'category_slug',
        'total_questions',
        'correct_answers',
        'score',
        'time_taken',
        'grade',
        'passed',
        'question_results',
    ];

    protected function casts(): array
    {
        return [
            'total_questions' => 'integer',
            'correct_answers' => 'integer',
            'score' => 'integer',
            'time_taken' => 'integer',
            'passed' => 'boolean',
            'question_results' => 'array',
        ];
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->uuid)) {
                $model->uuid = (string) Str::uuid();
            }

            // Calculate grade
            $model->grade = static::calculateGrade($model->score);
            $model->passed = $model->score >= 70;
        });
    }

    /**
     * Calculate grade from score.
     */
    public static function calculateGrade(int $score): string
    {
        return match (true) {
            $score >= 90 => 'A',
            $score >= 80 => 'B',
            $score >= 70 => 'C',
            $score >= 60 => 'D',
            default => 'F',
        };
    }

    /**
     * Get the user.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the category.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(RoadSignCategory::class, 'road_sign_category_id');
    }

    /**
     * Get wrong answers count.
     */
    public function getWrongAnswersAttribute(): int
    {
        return $this->total_questions - $this->correct_answers;
    }

    /**
     * Get formatted time.
     */
    public function getFormattedTimeAttribute(): string
    {
        $minutes = floor($this->time_taken / 60);
        $seconds = $this->time_taken % 60;

        if ($minutes === 0) {
            return "{$seconds} seconds";
        }

        return "{$minutes} min {$seconds} sec";
    }

    /**
     * Get average time per question.
     */
    public function getAverageTimePerQuestionAttribute(): int
    {
        if ($this->total_questions === 0) {
            return 0;
        }

        return (int) round($this->time_taken / $this->total_questions);
    }

    /**
     * Scope to passed attempts.
     */
    public function scopePassed($query)
    {
        return $query->where('passed', true);
    }

    /**
     * Scope for a specific user.
     */
    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }
}
