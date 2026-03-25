<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #F4F4E8; margin: 0; padding: 0; }
        .wrapper { max-width: 600px; margin: 40px auto; background: white; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 40px rgba(0,0,0,0.08); }
        .header { background: #0B3022; padding: 40px 48px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -0.03em; }
        .header span { color: #D4AF37; }
        .badge { display: inline-block; background: rgba(255,255,255,0.15); color: white; border-radius: 100px; padding: 4px 14px; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; margin-bottom: 12px; }
        .body { padding: 48px; }
        .field { margin-bottom: 24px; }
        .field-label { font-size: 11px; font-weight: 700; color: #0B3022; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 6px; }
        .field-value { font-size: 16px; color: #222; padding: 14px 20px; background: #F4F4E8; border-radius: 12px; line-height: 1.6; }
        .message-box { padding: 20px; background: #F4F4E8; border-radius: 16px; border-left: 4px solid #0B3022; font-size: 15px; color: #333; line-height: 1.7; }
        .footer { background: #0B3022; padding: 24px 48px; text-align: center; }
        .footer p { color: rgba(255,255,255,0.6); font-size: 12px; margin: 0; }
        .footer a { color: #D4AF37; text-decoration: none; font-weight: 700; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="header">
            <div class="badge">NUEVO MENSAJE</div>
            <h1>JOPPA <span>CRM</span></h1>
        </div>
        <div class="body">
            <div class="field">
                <div class="field-label">Nombre</div>
                <div class="field-value">{{ $contactMessage->name }}</div>
            </div>
            <div class="field">
                <div class="field-label">Correo Electrónico</div>
                <div class="field-value">
                    <a href="mailto:{{ $contactMessage->email }}" style="color:#0B3022; font-weight:700;">
                        {{ $contactMessage->email }}
                    </a>
                </div>
            </div>
            @if($contactMessage->phone)
            <div class="field">
                <div class="field-label">Teléfono</div>
                <div class="field-value">{{ $contactMessage->phone }}</div>
            </div>
            @endif
            @if($contactMessage->subject)
            <div class="field">
                <div class="field-label">Asunto</div>
                <div class="field-value">{{ $contactMessage->subject }}</div>
            </div>
            @endif
            <div class="field">
                <div class="field-label">Mensaje</div>
                <div class="message-box">{{ $contactMessage->message }}</div>
            </div>
            <p style="font-size:13px; color:#888; margin-top:32px;">
                Recibido el {{ $contactMessage->created_at->format('d/m/Y \a \l\a\s H:i') }}
            </p>
        </div>
        <div class="footer">
            <p>JOPPA Boutique · <a href="https://joppa.shop">joppa.shop</a></p>
        </div>
    </div>
</body>
</html>
