<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\QuizQuestion;
use App\Models\QuizAttempt;
use App\Models\RoadSignCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class QuizController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/v1/quiz/categories",
     *     summary="List quiz categories",
     *     tags={"Road Signs"},
     *     @OA\Response(response=200, description="Success")
     * )
     */
    public function categories(): JsonResponse
    {
        $categories = RoadSignCategory::active()
            ->withCount(['quizQuestions' => fn($q) => $q->active()])
            ->ordered()
            ->get()
            ->map(fn($cat) => [
                'id' => $cat->id,
                'name' => $cat->name,
                'slug' => $cat->slug,
                'description' => $cat->description,
                'color' => $cat->color,
                'icon' => $cat->icon,
                'questions_count' => $cat->quiz_questions_count,
            ]);

        // Add "All" category
        $allCount = QuizQuestion::active()->count();
        $categories->prepend([
            'id' => null,
            'name' => 'All Road Signs',
            'slug' => 'all',
            'description' => 'Test your knowledge on all road signs',
            'color' => '#3B82F6',
            'icon' => 'library',
            'questions_count' => $allCount,
        ]);

        return $this->success($categories);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/quiz/questions/{category}",
     *     summary="Get quiz questions for category",
     *     tags={"Road Signs"},
     *     @OA\Parameter(name="category", in="path", required=true, @OA\Schema(type="string")),
     *     @OA\Parameter(name="limit", in="query", @OA\Schema(type="integer", default=10)),
     *     @OA\Response(response=200, description="Success")
     * )
     */
    public function questions(Request $request, string $category): JsonResponse
    {
        $limit = min($request->get('limit', 10), 20);

        $query = QuizQuestion::active();

        if ($category !== 'all') {
            $categoryModel = RoadSignCategory::where('slug', $category)->firstOrFail();
            $query->forCategory($categoryModel->id);
        }

        $questions = $query->inRandomOrder()
            ->limit($limit)
            ->get()
            ->map(fn($q) => [
                'id' => $q->id,
                'question' => $q->question,
                'image' => $q->image,
                'options' => $q->options,
                'difficulty' => $q->difficulty,
            ]);

        return $this->success([
            'category' => $category,
            'questions' => $questions,
            'total' => $questions->count(),
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/v1/quiz/submit",
     *     summary="Submit quiz answers",
     *     tags={"Road Signs"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(required=true, @OA\JsonContent(
     *         @OA\Property(property="category", type="string"),
     *         @OA\Property(property="answers", type="array", @OA\Items(type="object",
     *             @OA\Property(property="question_id", type="integer"),
     *             @OA\Property(property="answer_index", type="integer")
     *         )),
     *         @OA\Property(property="time_taken", type="integer")
     *     )),
     *     @OA\Response(response=200, description="Success")
     * )
     */
    public function submit(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category' => 'required|string',
            'answers' => 'required|array|min:1',
            'answers.*.question_id' => 'required|exists:quiz_questions,id',
            'answers.*.answer_index' => 'required|integer|min:0',
            'time_taken' => 'required|integer|min:1',
        ]);

        $results = [];
        $correctCount = 0;

        foreach ($validated['answers'] as $answer) {
            $question = QuizQuestion::find($answer['question_id']);
            $isCorrect = $question->isCorrectAnswer($answer['answer_index']);

            if ($isCorrect) {
                $correctCount++;
            }

            // Record the answer
            $question->recordAnswer($isCorrect);

            $results[] = [
                'question_id' => $question->id,
                'correct' => $isCorrect,
                'correct_answer_index' => $question->correct_answer_index,
                'explanation' => $question->explanation,
            ];
        }

        $totalQuestions = count($validated['answers']);
        $score = $totalQuestions > 0 ? round(($correctCount / $totalQuestions) * 100) : 0;

        // Get category info
        $categoryId = null;
        if ($validated['category'] !== 'all') {
            $categoryModel = RoadSignCategory::where('slug', $validated['category'])->first();
            $categoryId = $categoryModel?->id;
        }

        // Create attempt record
        $attempt = QuizAttempt::create([
            'user_id' => $request->user()->id,
            'road_sign_category_id' => $categoryId,
            'category_slug' => $validated['category'],
            'total_questions' => $totalQuestions,
            'correct_answers' => $correctCount,
            'score' => $score,
            'time_taken' => $validated['time_taken'],
            'question_results' => $results,
        ]);

        return $this->success([
            'attempt_id' => $attempt->id,
            'score' => $score,
            'correct' => $correctCount,
            'total' => $totalQuestions,
            'grade' => $attempt->grade,
            'passed' => $attempt->passed,
            'time_taken' => $attempt->time_taken,
            'formatted_time' => $attempt->formatted_time,
            'results' => $results,
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/quiz/history",
     *     summary="Get quiz attempt history",
     *     tags={"Road Signs"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Success")
     * )
     */
    public function history(Request $request): JsonResponse
    {
        $attempts = $request->user()
            ->quizAttempts()
            ->with('category')
            ->latest()
            ->paginate(15);

        return $this->success($attempts);
    }
}
