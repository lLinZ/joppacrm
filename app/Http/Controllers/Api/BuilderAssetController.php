<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;

class BuilderAssetController extends Controller
{
    private string $assetPath = 'images/custom_design_builder';

    public function index()
    {
        $dir = public_path($this->assetPath);
        
        if (!File::exists($dir)) {
            File::makeDirectory($dir, 0755, true);
        }

        $files = File::files($dir);
        $assets = [];

        foreach ($files as $file) {
            // Only return images
            if (in_array(strtolower($file->getExtension()), ['png', 'jpg', 'jpeg', 'webp'])) {
                $assets[] = [
                    'name' => $file->getFilename(),
                    'url'  => '/' . $this->assetPath . '/' . $file->getFilename(),
                    'size' => $file->getSize(),
                    'time' => $file->getMTime(),
                ];
            }
        }

        // Sort by newest first
        usort($assets, fn($a, $b) => $b['time'] <=> $a['time']);

        return response()->json($assets);
    }

    public function store(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:png,jpg,jpeg,webp|max:2048', // 2MB limit
        ]);

        $file = $request->file('image');
        // Clean filename: remove special chars, spaces to underscores
        $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $cleanName = preg_replace('/[^A-Za-z0-9_\-]/', '_', $originalName);
        $filename = $cleanName . '_' . time() . '.' . $file->getClientOriginalExtension();

        $dir = public_path($this->assetPath);
        
        if (!File::exists($dir)) {
            File::makeDirectory($dir, 0755, true);
        }

        $file->move($dir, $filename);

        return response()->json([
            'message' => 'Imagen subida correctamente',
            'asset' => [
                'name' => $filename,
                'url'  => '/' . $this->assetPath . '/' . $filename,
            ]
        ], 201);
    }

    public function destroy($filename)
    {
        // Sanitize filename to prevent directory traversal
        $filename = basename($filename);
        $path = public_path($this->assetPath . '/' . $filename);

        if (File::exists($path)) {
            File::delete($path);
            return response()->json(['message' => 'Imagen eliminada correctamente']);
        }

        return response()->json(['message' => 'Imagen no encontrada'], 404);
    }
}
