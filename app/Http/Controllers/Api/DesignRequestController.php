<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\DesignRequest;
use Illuminate\Support\Facades\Storage;

class DesignRequestController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'state' => 'nullable|string|max:50',
            'general_comments' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.gender' => 'required|string',
            'items.*.style' => 'required|string',
            'items.*.color' => 'required|string',
            'items.*.size' => 'required|string',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.image' => 'nullable|file|mimes:jpeg,png,jpg,webp,pdf|max:5120', // 5MB limit
        ]);

        $designRequest = DesignRequest::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'state' => $validated['state'] ?? null,
            'general_comments' => $validated['general_comments'] ?? null,
            'status' => 'pending',
        ]);

        foreach ($validated['items'] as $index => $itemData) {
            $imagePath = null;
            
            // Access deeply nested files correctly in Laravel
            if ($request->hasFile("items.{$index}.image")) {
                $file = $request->file("items.{$index}.image");
                $imagePath = $file->store('design_requests', 'public');
            }

            $designRequest->items()->create([
                'gender' => $itemData['gender'],
                'style' => $itemData['style'],
                'color' => $itemData['color'],
                'size' => $itemData['size'],
                'quantity' => $itemData['quantity'],
                'image_path' => $imagePath ? '/storage/' . $imagePath : null,
            ]);
        }

        return response()->json([
            'message' => 'Solicitud recibida exitosamente.',
            'design_request' => $designRequest->load('items')
        ], 201);
    }
}
