<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #F4F4E8; margin: 0; padding: 0; }
        .wrapper { max-width: 600px; margin: 40px auto; background: white; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 40px rgba(0,0,0,0.08); }
        .header { background: #0B3022; padding: 44px 48px; text-align: center; }
        .header .badge { display: inline-block; background: rgba(212,175,55,0.2); color: #D4AF37; border-radius: 100px; padding: 5px 16px; font-size: 12px; font-weight: 700; letter-spacing: 0.1em; margin-bottom: 16px; }
        .header h1 { color: white; margin: 0; font-size: 30px; font-weight: 900; letter-spacing: -0.03em; }
        .header h1 span { color: #D4AF37; }
        .body { padding: 44px 48px; color: #333; }
        .greeting { font-size: 20px; font-weight: 800; color: #0B3022; margin: 0 0 16px; }
        .lead { font-size: 16px; line-height: 1.7; color: #444; margin: 0 0 28px; }
        .steps { background: #F4F4E8; border-radius: 16px; padding: 8px 24px; margin: 0 0 28px; }
        .step { padding: 16px 0; border-bottom: 1px solid rgba(11,48,34,0.08); }
        .step:last-child { border-bottom: none; }
        .step-num { display: inline-block; width: 26px; height: 26px; line-height: 26px; text-align: center; background: #0B3022; color: #D4AF37; border-radius: 50%; font-size: 13px; font-weight: 800; margin-right: 12px; }
        .step-text { font-size: 15px; color: #333; vertical-align: middle; }
        .recap { border: 1px solid rgba(11,48,34,0.1); border-radius: 16px; padding: 20px 24px; margin: 0 0 28px; }
        .recap-title { font-size: 11px; font-weight: 700; color: #0B3022; letter-spacing: 0.1em; text-transform: uppercase; margin: 0 0 12px; }
        .recap-row { font-size: 14px; color: #444; padding: 5px 0; }
        .recap-row strong { color: #0B3022; }
        .closing { font-size: 15px; line-height: 1.7; color: #444; margin: 0; }
        .signature { font-size: 15px; color: #0B3022; font-weight: 700; margin-top: 20px; }
        .footer { background: #0B3022; padding: 28px 48px; text-align: center; }
        .footer p { color: rgba(255,255,255,0.6); font-size: 12px; margin: 0 0 8px; }
        .footer a { color: #D4AF37; text-decoration: none; font-weight: 700; }
        .footer .social { margin-top: 6px; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="header">
            <div class="badge">POSTULACIÓN RECIBIDA</div>
            <h1>JOPPA<span>.</span></h1>
        </div>

        <div class="body">
            <p class="greeting">¡Hola, {{ $application->name }}! 👋</p>

            <p class="lead">
                Gracias por postularte para coser con nosotros. <strong>Ya recibimos tu solicitud y está en proceso de revisión.</strong>
                Nuestro equipo va a mirar con calma tu trabajo y tu propuesta.
            </p>

            <div class="steps">
                <div class="step">
                    <span class="step-num">1</span>
                    <span class="step-text">Revisamos tu perfil y las fotos de tu trabajo.</span>
                </div>
                <div class="step">
                    <span class="step-num">2</span>
                    <span class="step-text">Si encajas con lo que buscamos, te contactamos por WhatsApp o correo.</span>
                </div>
                <div class="step">
                    <span class="step-num">3</span>
                    <span class="step-text">Coordinamos un primer lote de prueba y arrancamos.</span>
                </div>
            </div>

            <div class="recap">
                <p class="recap-title">Esto fue lo que registramos</p>
                <div class="recap-row"><strong>Ubicación:</strong> {{ $application->location }}</div>
                @if($application->price_per_piece !== null)
                <div class="recap-row"><strong>Tu tarifa por pieza:</strong> ${{ number_format((float) $application->price_per_piece, 2) }} USD</div>
                @endif
                @if($application->weekly_capacity)
                <div class="recap-row"><strong>Capacidad semanal:</strong> {{ $application->weekly_capacity }} piezas</div>
                @endif
            </div>

            <p class="closing">
                No necesitas hacer nada más por ahora. Si tienes alguna duda mientras tanto, puedes responder
                directamente a este correo y con gusto te ayudamos.
            </p>

            <p class="signature">— El equipo de Joppa 🧵</p>
        </div>

        <div class="footer">
            <p>JOPPA Boutique · <a href="https://joppa.shop">joppa.shop</a></p>
            <p class="social">
                <a href="https://instagram.com/joppa.shop">@joppa.shop</a>
            </p>
        </div>
    </div>
</body>
</html>
