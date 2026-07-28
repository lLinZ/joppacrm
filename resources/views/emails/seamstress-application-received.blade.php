<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light only">
    <title>Recibimos tu postulación</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');

        body { margin: 0; padding: 0; background: #EDEBDD; -webkit-font-smoothing: antialiased; }
        .sans { font-family: 'Montserrat', 'Helvetica Neue', Arial, sans-serif; }
        a { text-decoration: none; }
        @media (max-width: 620px) {
            .card { border-radius: 0 !important; }
            .pad { padding-left: 30px !important; padding-right: 30px !important; }
            .h1 { font-size: 30px !important; }
        }
    </style>
</head>
<body class="sans" style="margin:0; padding:0; background:#EDEBDD;">

    <!-- Preheader oculto (texto de vista previa en la bandeja) -->
    <div style="display:none; max-height:0; overflow:hidden; opacity:0;">
        Recibimos tu postulación y la estamos revisando con calma. Gracias por querer coser con Joppa.
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EDEBDD;">
        <tr>
            <td align="center" style="padding: 40px 16px;">

                <table role="presentation" width="600" cellpadding="0" cellspacing="0" class="card"
                       style="width:600px; max-width:100%; background:#ffffff; border-radius:28px; overflow:hidden; box-shadow:0 10px 60px rgba(11,48,34,0.12);">

                    <!-- HEADER -->
                    <tr>
                        <td style="background:#0B3022; padding:54px 48px 48px; text-align:center;">
                            <div class="sans" style="display:inline-block; border:1px solid rgba(212,175,55,0.45); color:#D4AF37; border-radius:100px; padding:7px 20px; font-size:11px; font-weight:700; letter-spacing:0.22em;">
                                POSTULACIÓN RECIBIDA
                            </div>
                            <div class="sans" style="color:#ffffff; font-size:48px; font-weight:900; letter-spacing:-0.02em; margin-top:24px; line-height:1;">
                                JOPPA<span style="color:#D4AF37;">.</span>
                            </div>
                        </td>
                    </tr>

                    <!-- Franja dorada -->
                    <tr><td style="height:5px; background:#D4AF37; line-height:5px; font-size:0;">&nbsp;</td></tr>

                    <!-- BODY -->
                    <tr>
                        <td class="pad" style="padding:52px 56px 40px;">

                            <p class="sans" style="margin:0 0 10px; font-size:15px; font-weight:700; color:#D4AF37; letter-spacing:0.02em;">
                                ¡Hola, {{ $application->name }}!
                            </p>

                            <h1 class="sans h1" style="margin:0 0 28px; font-size:36px; line-height:1.15; font-weight:900; letter-spacing:-0.03em; color:#0B3022;">
                                Gracias por querer<br>coser con nosotros.
                            </h1>

                            <p class="sans" style="margin:0 0 22px; font-size:16.5px; line-height:1.8; font-weight:500; color:#4a4a4a;">
                                Recibimos tu postulación y ya está <strong style="color:#0B3022; font-weight:700;">en nuestras manos</strong>.
                                La estaremos revisando con calma y con el cariño que merece, porque para nosotros
                                el talento de quien está detrás de cada prenda lo es todo.
                            </p>

                            <!-- Cita destacada -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 26px;">
                                <tr>
                                    <td style="background:#F6F4EA; border-left:4px solid #D4AF37; border-radius:0 16px 16px 0; padding:22px 26px;">
                                        <p class="sans" style="margin:0; font-size:17px; line-height:1.6; color:#0B3022; font-weight:600;">
                                            Si tu propuesta encaja con lo que estamos buscando, nos pondremos en contacto contigo muy pronto.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <p class="sans" style="margin:0 0 30px; font-size:16px; line-height:1.8; font-weight:500; color:#4a4a4a;">
                                Por ahora no necesitas hacer nada más. Si tienes alguna duda, puedes
                                <strong style="color:#0B3022; font-weight:700;">responder directamente a este correo</strong> y con gusto te ayudamos.
                            </p>

                            <!-- Firma -->
                            <p class="sans" style="margin:0; font-size:15px; line-height:1.6; font-weight:500; color:#4a4a4a;">Con cariño,</p>
                            <p class="sans" style="margin:3px 0 0; font-size:19px; font-weight:800; letter-spacing:-0.01em; color:#0B3022;">El equipo de Joppa</p>

                        </td>
                    </tr>

                    <!-- FOOTER -->
                    <tr>
                        <td style="background:#0B3022; padding:30px 48px; text-align:center;">
                            <a href="https://joppa.shop" class="sans" style="color:#ffffff; font-size:14px; font-weight:700; letter-spacing:0.03em;">joppa.shop</a>
                            <span style="color:rgba(255,255,255,0.3); margin:0 10px;">·</span>
                            <a href="https://instagram.com/joppa.shop" class="sans" style="color:#D4AF37; font-size:14px; font-weight:700;">@joppa.shop</a>
                            <p class="sans" style="margin:16px 0 0; color:rgba(255,255,255,0.45); font-size:11px; font-weight:500; line-height:1.6;">
                                Recibiste este correo porque te postulaste en joppa.shop
                            </p>
                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>
</html>
