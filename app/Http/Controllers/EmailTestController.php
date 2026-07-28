<?php

namespace App\Http\Controllers;

use App\Mail\NewContactMessage;
use App\Mail\SeamstressApplicationReceived;
use App\Models\ContactMessage;
use App\Models\SeamstressApplication;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class EmailTestController extends Controller
{
    private const TEMPLATES = [
        'seamstress_received' => 'Confirmación de postulante (costurera)',
        'contact_message'     => 'Mensaje de contacto (aviso interno)',
    ];

    public function index()
    {
        return Inertia::render('Tools/EmailTest', [
            'templates'   => collect(self::TEMPLATES)->map(fn ($label, $value) => [
                'value' => $value,
                'label' => $label,
            ])->values(),
            'fromAddress' => config('mail.from.address'),
            'mailer'      => config('mail.default'),
        ]);
    }

    public function send(Request $request)
    {
        $validated = $request->validate([
            'email'    => 'required|email|max:255',
            'template' => 'required|in:' . implode(',', array_keys(self::TEMPLATES)),
        ]);

        $mailable = $this->buildSampleMailable($validated['template'], $validated['email']);

        try {
            Mail::to($validated['email'])->send($mailable);
        } catch (\Throwable $e) {
            Log::error('Test email failed: ' . $e->getMessage());

            // Devolvemos el mensaje real del error para poder depurar el SMTP
            return back()->with('error', 'No se pudo enviar: ' . $e->getMessage());
        }

        $mailer = config('mail.default');
        $note = $mailer === 'log'
            ? ' (MAIL_MAILER está en "log": el correo se escribió en storage/logs/laravel.log, no se envió de verdad)'
            : '';

        return back()->with('success', 'Correo de prueba enviado a ' . $validated['email'] . '.' . $note);
    }

    private function buildSampleMailable(string $template, string $email)
    {
        return match ($template) {
            'seamstress_received' => new SeamstressApplicationReceived(
                tap(new SeamstressApplication([
                    'name'            => 'Costurera de Prueba',
                    'email'           => $email,
                    'location'        => 'Valencia, Carabobo',
                    'price_per_piece' => 3.50,
                    'weekly_capacity' => 45,
                ]), fn ($m) => $m->created_at = now())
            ),
            'contact_message' => new NewContactMessage(
                tap(new ContactMessage([
                    'name'    => 'Cliente de Prueba',
                    'email'   => $email,
                    'phone'   => '+58 412 555 0000',
                    'subject' => 'Mensaje de prueba',
                    'message' => 'Este es un mensaje de contacto de prueba para revisar la plantilla.',
                ]), fn ($m) => $m->created_at = now())
            ),
        };
    }
}
