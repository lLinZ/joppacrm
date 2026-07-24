<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SeamstressApplication extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'machines'         => 'array',
        'photos'           => 'array',
        'price_per_piece'  => 'decimal:2',
        'weekly_capacity'  => 'integer',
    ];

    public const EXPERIENCE_LABELS = [
        'menos_1' => 'Menos de 1 año',
        '1_3'     => 'Entre 1 y 3 años',
        '3_5'     => 'Entre 3 y 5 años',
        'mas_5'   => 'Más de 5 años',
    ];

    public const MACHINE_LABELS = [
        'recta'     => 'Recta',
        'overlock'  => 'Overlock',
        'collarin'  => 'Collarín',
        'bordadora' => 'Bordadora',
        'familiar'  => 'Familiar',
        'ninguna'   => 'Ninguna (trabajo en taller)',
    ];
}
