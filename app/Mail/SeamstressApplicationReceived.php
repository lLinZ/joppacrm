<?php

namespace App\Mail;

use App\Models\SeamstressApplication;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SeamstressApplicationReceived extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public SeamstressApplication $application)
    {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '✨ Recibimos tu postulación · Joppa',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.seamstress-application-received',
        );
    }
}
