<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class FileUploadService
{
    protected string $disk;

    public function __construct()
    {
        $this->disk = config('filesystems.default') === 's3' ? 's3' : 'media';
    }

    /**
     * Upload a file to storage.
     *
     * @param UploadedFile $file The file to upload
     * @param string $directory The directory to store the file in
     * @param string|null $filename Custom filename (optional)
     * @return array File information including path and URL
     */
    public function upload(UploadedFile $file, string $directory, ?string $filename = null): array
    {
        $filename = $filename ?? $this->generateFilename($file);
        $path = $file->storeAs($directory, $filename, $this->disk);

        return [
            'path' => $path,
            'url' => $this->getUrl($path),
            'filename' => $filename,
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
            'disk' => $this->disk,
        ];
    }

    /**
     * Upload multiple files.
     *
     * @param array $files Array of UploadedFile objects
     * @param string $directory The directory to store files in
     * @return array Array of file information
     */
    public function uploadMultiple(array $files, string $directory): array
    {
        $uploaded = [];

        foreach ($files as $file) {
            if ($file instanceof UploadedFile) {
                $uploaded[] = $this->upload($file, $directory);
            }
        }

        return $uploaded;
    }

    /**
     * Delete a file from storage.
     *
     * @param string $path The file path to delete
     * @param string|null $disk Override the disk
     * @return bool
     */
    public function delete(string $path, ?string $disk = null): bool
    {
        return Storage::disk($disk ?? $this->disk)->delete($path);
    }

    /**
     * Delete multiple files.
     *
     * @param array $paths Array of file paths
     * @param string|null $disk Override the disk
     * @return bool
     */
    public function deleteMultiple(array $paths, ?string $disk = null): bool
    {
        return Storage::disk($disk ?? $this->disk)->delete($paths);
    }

    /**
     * Get the URL for a file.
     *
     * @param string $path The file path
     * @param string|null $disk Override the disk
     * @return string
     */
    public function getUrl(string $path, ?string $disk = null): string
    {
        return Storage::disk($disk ?? $this->disk)->url($path);
    }

    /**
     * Check if a file exists.
     *
     * @param string $path The file path
     * @param string|null $disk Override the disk
     * @return bool
     */
    public function exists(string $path, ?string $disk = null): bool
    {
        return Storage::disk($disk ?? $this->disk)->exists($path);
    }

    /**
     * Get file contents.
     *
     * @param string $path The file path
     * @param string|null $disk Override the disk
     * @return string|null
     */
    public function get(string $path, ?string $disk = null): ?string
    {
        return Storage::disk($disk ?? $this->disk)->get($path);
    }

    /**
     * Generate a unique filename.
     *
     * @param UploadedFile $file
     * @return string
     */
    protected function generateFilename(UploadedFile $file): string
    {
        $extension = $file->getClientOriginalExtension();
        $name = Str::uuid()->toString();

        return "{$name}.{$extension}";
    }

    /**
     * Upload an avatar image.
     *
     * @param UploadedFile $file
     * @param int $userId
     * @return array
     */
    public function uploadAvatar(UploadedFile $file, int $userId): array
    {
        return $this->upload($file, "avatars/{$userId}");
    }

    /**
     * Upload a vehicle image.
     *
     * @param UploadedFile $file
     * @param int $vehicleId
     * @return array
     */
    public function uploadVehicleImage(UploadedFile $file, int $vehicleId): array
    {
        return $this->upload($file, "vehicles/{$vehicleId}");
    }

    /**
     * Upload a diagnosis image.
     *
     * @param UploadedFile $file
     * @param int $diagnosisId
     * @return array
     */
    public function uploadDiagnosisImage(UploadedFile $file, int $diagnosisId): array
    {
        return $this->upload($file, "diagnoses/{$diagnosisId}");
    }

    /**
     * Upload a KYC document.
     *
     * @param UploadedFile $file
     * @param int $userId
     * @param string $documentType
     * @return array
     */
    public function uploadKycDocument(UploadedFile $file, int $userId, string $documentType): array
    {
        return $this->upload($file, "kyc/{$userId}/{$documentType}");
    }

    /**
     * Upload an expert profile image.
     *
     * @param UploadedFile $file
     * @param int $expertProfileId
     * @return array
     */
    public function uploadExpertImage(UploadedFile $file, int $expertProfileId): array
    {
        return $this->upload($file, "experts/{$expertProfileId}");
    }
}
