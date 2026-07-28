<?php

namespace App\Http\Controllers;

use App\Notifications\TestPushNotification;
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

        $subscription = $request->user()->updatePushSubscription(
            $validated['endpoint'],
            $validated['keys']['p256dh'],
            $validated['keys']['auth']
        );

        // Guardamos un nombre legible para poder distinguir los dispositivos
        $subscription->forceFill(['device_name' => $this->deviceName($request->userAgent())])->save();

        return response()->json([
            'success' => true,
            'device'  => $subscription->device_name,
        ]);
    }

    /**
     * Lista los dispositivos suscritos del usuario.
     */
    public function index(Request $request)
    {
        return response()->json([
            'devices' => $request->user()->pushSubscriptions()
                ->latest()
                ->get(['id', 'endpoint', 'device_name', 'created_at'])
                ->map(fn ($s) => [
                    'id'          => $s->id,
                    'endpoint'    => $s->endpoint,
                    'device_name' => $s->device_name ?: 'Dispositivo sin identificar',
                    'created_at'  => $s->created_at?->format('d/m/Y H:i'),
                ]),
        ]);
    }

    /**
     * Elimina la suscripción indicada (o la de este dispositivo).
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
     * Envía una notificación de prueba. Si se indica un endpoint, sólo va a ese
     * dispositivo; si no, va a todos los del usuario.
     */
    public function test(Request $request)
    {
        $validated = $request->validate([
            'endpoint' => 'nullable|string',
        ]);

        $user = $request->user();
        $endpoint = $validated['endpoint'] ?? null;

        if ($endpoint) {
            $target = $user->pushSubscriptions()->where('endpoint', $endpoint)->first();

            if (! $target) {
                return back()->with('error', 'Este dispositivo no aparece registrado. Desactiva y vuelve a activar las notificaciones aquí.');
            }

            $user->pushOnlyTo($endpoint)->notify(new TestPushNotification());

            return back()->with('success', 'Notificación enviada a este dispositivo (' . ($target->device_name ?: 'sin nombre') . ').');
        }

        $total = $user->pushSubscriptions()->count();

        if ($total === 0) {
            return back()->with('error', 'No tienes ningún dispositivo registrado todavía.');
        }

        $user->notify(new TestPushNotification());

        return back()->with('success', 'Notificación enviada a tus ' . $total . ' dispositivo' . ($total !== 1 ? 's' : '') . '.');
    }

    /**
     * Nombre legible a partir del user agent (ej: "Chrome en Android").
     */
    private function deviceName(?string $userAgent): string
    {
        $ua = $userAgent ?? '';

        $browser = match (true) {
            str_contains($ua, 'Edg')                             => 'Edge',
            str_contains($ua, 'OPR') || str_contains($ua, 'Opera') => 'Opera',
            str_contains($ua, 'Firefox')                         => 'Firefox',
            str_contains($ua, 'Chrome')                          => 'Chrome',
            str_contains($ua, 'Safari')                          => 'Safari',
            default                                              => 'Navegador',
        };

        $system = match (true) {
            str_contains($ua, 'Android')                            => 'Android',
            str_contains($ua, 'iPhone')                             => 'iPhone',
            str_contains($ua, 'iPad')                               => 'iPad',
            str_contains($ua, 'Windows')                            => 'Windows',
            str_contains($ua, 'Mac OS') || str_contains($ua, 'Macintosh') => 'Mac',
            str_contains($ua, 'Linux')                              => 'Linux',
            default                                                 => 'dispositivo desconocido',
        };

        return $browser . ' en ' . $system;
    }
}
