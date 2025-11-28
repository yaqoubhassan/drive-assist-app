<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;

/**
 * @OA\Info(
 *     title="DriveAssist API",
 *     version="1.0.0",
 *     description="API documentation for DriveAssist - Vehicle Diagnostics and Expert Marketplace",
 *     @OA\Contact(
 *         email="support@driveassist.com",
 *         name="DriveAssist Support"
 *     )
 * )
 *
 * @OA\Server(
 *     url=L5_SWAGGER_CONST_HOST,
 *     description="API Server"
 * )
 *
 * @OA\SecurityScheme(
 *     securityScheme="bearerAuth",
 *     type="http",
 *     scheme="bearer",
 *     bearerFormat="JWT"
 * )
 *
 * @OA\Tag(
 *     name="Authentication",
 *     description="User authentication endpoints"
 * )
 * @OA\Tag(
 *     name="Users",
 *     description="User management endpoints"
 * )
 * @OA\Tag(
 *     name="Vehicles",
 *     description="Vehicle management endpoints"
 * )
 * @OA\Tag(
 *     name="Diagnoses",
 *     description="Vehicle diagnosis endpoints"
 * )
 * @OA\Tag(
 *     name="Experts",
 *     description="Expert-related endpoints"
 * )
 * @OA\Tag(
 *     name="Leads",
 *     description="Lead management endpoints"
 * )
 * @OA\Tag(
 *     name="Packages",
 *     description="Package and subscription endpoints"
 * )
 * @OA\Tag(
 *     name="Road Signs",
 *     description="Road signs and quiz endpoints"
 * )
 * @OA\Tag(
 *     name="Articles",
 *     description="Learning articles endpoints"
 * )
 * @OA\Tag(
 *     name="Maintenance",
 *     description="Maintenance reminder endpoints"
 * )
 */
abstract class Controller extends BaseController
{
    use AuthorizesRequests, ValidatesRequests;

    /**
     * Return a success JSON response.
     */
    protected function success($data = null, string $message = 'Success', int $code = 200)
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $code);
    }

    /**
     * Return an error JSON response.
     */
    protected function error(string $message = 'Error', int $code = 400, $errors = null)
    {
        $response = [
            'success' => false,
            'message' => $message,
        ];

        if ($errors) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $code);
    }
}
