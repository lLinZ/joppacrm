<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class PushSubscriptionController extends Controller
{
    /**
     * Guarda (o actualiza) la suscripción push del navegador/teléfono actual.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'endpoint'    => 'required|string',
            'keys.auth'   => 'required|string',
            'keys.p256dh' => 'required|string',
        ]);

        $request->user()->updatePushSubscription(
            $validated['endpoint'],
            $validated['keys']['p256dh'],
            $validated['keys']['auth']
        );

        return response()->json(['success' => true]);
    }

    /**
     * Elimina la suscripción de este dispositivo (el usuario apagó las notificaciones).
     */
    public function destroy(Request $request)
    {
        $validated = $request->validate([
            'endpoint' => 'required|string',
        ]);

        $request->user()->deletePushSubscription($validated['endpoint']);

        return response()->json(['success' => true]);
    }

    /**
     * Envía una notificación de prueba al dispositivo actual.
     */
    public function test(Request $request)
    {
        $request->user()->notify(new \App\Notifications\TestPushNotification());

        return back()->with('success', 'Notificación de prueba enviada. Debería aparecer en unos segundos.');
    }
}
