<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\WebTrafficSession;
use Illuminate\Support\Carbon;

class TrackingController extends Controller
{
    public function heartbeat(Request $request)
    {
        $validated = $request->validate([
            'visitor_id' => 'required|string|max:255',
            'url' => 'nullable|string|max:500',
            'source' => 'nullable|string|max:255',
        ]);

        $visitorId = $validated['visitor_id'];
        $url = $validated['url'] ?? null;
        $source = $validated['source'] ?? 'Orgánico / Directo';
        $now = Carbon::now();

        // Buscamos una sesión del visitante que haya tenido actividad en los últimos 30 minutos
        $session = WebTrafficSession::where('visitor_id', $visitorId)
            ->where('last_active_at', '>=', $now->copy()->subMinutes(30))
            ->orderBy('last_active_at', 'desc')
            ->first();

        if ($session) {
            // Actualizar sesión existente
            $session->last_active_at = $now;
            
            // Actualizamos la URL para que capture slugs de navegación SPA o últimas páginas vistas
            if ($url) {
                $session->entry_url = $url;
            }
            
            // Calcular duración en segundos asegurando que no sea negativo (diferencia de timestamps absolutos)
            $session->duration_seconds = abs($now->getTimestamp() - $session->started_at->getTimestamp());
            
            $session->save();
        } else {
            // Crear nueva sesión (primera vez o pasaron >30 mins)
            $session = WebTrafficSession::create([
                'visitor_id' => $visitorId,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'source' => $source,
                'entry_url' => $url,
                'started_at' => $now,
                'last_active_at' => $now,
                'duration_seconds' => 0,
            ]);
        }

        return response()->json(['status' => 'ok']);
    }
}
