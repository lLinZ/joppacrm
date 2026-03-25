<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\NewContactMessage;
use App\Models\ContactMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class ContactMessageController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'    => 'required|string|max:255',
            'email'   => 'required|email|max:255',
            'phone'   => 'nullable|string|max:30',
            'subject' => 'nullable|string|max:255',
            'message' => 'required|string|min:10',
        ]);

        // Save to database
        $contactMessage = ContactMessage::create($validated);

        // Send email notification
        try {
            Mail::to('atencion@joppa.shop')->send(new NewContactMessage($contactMessage));
        } catch (\Throwable $e) {
            // Log the error but don't fail the request — message is saved in DB
            Log::error('Failed to send contact email: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Mensaje recibido exitosamente. Te contactaremos pronto.',
            'id'      => $contactMessage->id,
        ], 201);
    }
}
