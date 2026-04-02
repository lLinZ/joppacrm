<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\AbandonedDesign;
use Carbon\Carbon;

class AbandonedDesignController extends Controller
{
    public function ping(Request $request)
    {
        $validated = $request->validate([
            'session_id' => 'required|string|max:100',
            'design_data' => 'nullable|array',
            'duration_increment' => 'nullable|integer|min:0', // in seconds since last ping
        ]);

        $abandoned = AbandonedDesign::firstOrNew(['session_id' => $validated['session_id']]);

        // If it's a new record, set initial values
        if (!$abandoned->exists) {
            $abandoned->ip_address = $request->ip();
            $abandoned->duration_seconds = 0;
            $abandoned->status = 'abandoned'; // default
        }

        // Update data
        if (!empty($validated['design_data'])) {
            $abandoned->design_data = $validated['design_data'];
        }

        // Increment duration safely
        if (!empty($validated['duration_increment'])) {
            $abandoned->duration_seconds += $validated['duration_increment'];
        }

        $abandoned->last_active_at = Carbon::now();
        $abandoned->save();

        return response()->json(['status' => 'saved']);
    }
}
