<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\SeamstressApplicationReceived;
use App\Models\SeamstressApplication;
use App\Notifications\NewSeamstressApplicationNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;

class SeamstressApplicationController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'             => 'required|string|max:255',
            'email'            => 'required|email|max:255',
            'phone'            => 'required|string|max:30',
            'location'         => 'required|string|max:255',
            'price_per_piece'  => 'nullable|numeric|min:0|max:99999',
            'budget_notes'     => 'nullable|string|max:2000',
            'experience_years' => 'nullable|string|in:menos_1,1_3,3_5,mas_5',
            'machines'         => 'nullable|array',
            'machines.*'       => 'string|in:recta,overlock,collarin,bordadora,familiar,ninguna',
            'weekly_capacity'  => 'nullable|integer|min:0|max:10000',
            'message'          => 'nullable|string|max:5000',
            'photos'           => 'nullable|array|max:6',
            'photos.*'         => 'file|mimes:jpeg,png,jpg,webp|max:5120',
            'source'           => 'nullable|string|max:100',
        ]);

        $photoPaths = [];
        if ($request->hasFile('photos')) {
            foreach ($request->file('photos') as $photo) {
                $path = $photo->store('seamstress_applications', 'public');
                $photoPaths[] = '/storage/' . $path;
            }
        }

        $application = SeamstressApplication::create([
            'name'             => $validated['name'],
            'email'            => $validated['email'],
            'phone'            => $validated['phone'],
            'location'         => $validated['location'],
            'price_per_piece'  => $validated['price_per_piece'] ?? null,
            'budget_notes'     => $validated['budget_notes'] ?? null,
            'experience_years' => $validated['experience_years'] ?? null,
            'machines'         => $validated['machines'] ?? [],
            'weekly_capacity'  => $validated['weekly_capacity'] ?? null,
            'message'          => $validated['message'] ?? null,
            'photos'           => $photoPaths,
            'source'           => $validated['source'] ?? null,
            'status'           => 'pending',
        ]);

        try {
            Notification::send(\App\Models\User::all(), new NewSeamstressApplicationNotification($application));
        } catch (\Throwable $e) {
            // La postulación ya está guardada; no fallamos la petición por la notificación
            Log::error('Failed to notify new seamstress application: ' . $e->getMessage());
        }

        // Correo de confirmación a la postulante ("estamos revisando tu solicitud")
        try {
            Mail::to($application->email)->send(new SeamstressApplicationReceived($application));
        } catch (\Throwable $e) {
            // Si el correo falla (SMTP mal configurado, etc.) la postulación igual queda guardada
            Log::error('Failed to send seamstress confirmation email: ' . $e->getMessage());
        }

        return response()->json([
            'message' => '¡Postulación recibida! Te contactaremos pronto.',
            'id'      => $application->id,
        ], 201);
    }
}
