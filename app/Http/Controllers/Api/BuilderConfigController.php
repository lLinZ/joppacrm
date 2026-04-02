<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class BuilderConfigController extends Controller
{
    private string $configPath = 'builder-config.json';

    /**
     * Public endpoint: Returns the active builder configuration for the e-commerce.
     * Filters out disabled colors per variant, and disabled variants/products.
     */
    public function index()
    {
        $config = $this->loadConfig();

        $products = collect($config['products'] ?? [])
            ->filter(fn($p) => $p['enabled'] ?? true)
            ->map(function ($p) {
                // Filter variants: only enabled ones
                $variants = [];
                foreach (($p['variants'] ?? []) as $gender => $variant) {
                    if (!($variant['enabled'] ?? true)) continue;

                    // Filter enabled colors only
                    $colors = collect($variant['colors'] ?? [])
                        ->filter(fn($c) => $c['enabled'] ?? true)
                        ->map(fn($c) => ['label' => $c['label'], 'value' => $c['value']])
                        ->values()
                        ->toArray();

                    $variants[$gender] = [
                        'assets'  => $variant['assets'] ?? [],
                        'colors'  => $colors,
                        'sizes'   => $variant['sizes'] ?? [],
                    ];
                }

                return [
                    'id'        => $p['id'],
                    'name'      => $p['name'],
                    'basePrice' => $p['basePrice'],
                    'variants'  => $variants,
                ];
            })
            ->values()
            ->toArray();

        return response()->json([
            'products' => $products,
            'fonts'    => $config['fonts'] ?? [],
            'genders'  => $config['genders'] ?? ['Caballero', 'Dama'],
        ]);
    }

    /**
     * Admin endpoint: Returns the FULL config (including disabled items).
     * Returns Inertia page or JSON depending on request context.
     */
    public function adminIndex(Request $request)
    {
        $config = $this->loadConfig();

        if (!$request->expectsJson() && !$request->is('api/*')) {
            return Inertia::render('Settings/BuilderSettings', [
                'config' => $config,
            ]);
        }

        return response()->json($config);
    }

    /**
     * Admin endpoint: Saves the full configuration.
     */
    public function update(Request $request)
    {
        $request->validate([
            'products'             => 'required|array|min:1',
            'products.*.id'        => 'required|string|max:50',
            'products.*.name'      => 'required|string|max:100',
            'products.*.basePrice' => 'required|numeric|min:0',
            'products.*.enabled'   => 'required|boolean',
            'products.*.variants'  => 'required|array',
            'fonts'                => 'sometimes|array',
            'genders'              => 'sometimes|array',
        ]);

        $existing = $this->loadConfig();

        $config = [
            'products' => $request->products,
            'fonts'    => $request->fonts ?? $existing['fonts'] ?? [],
            'genders'  => $request->genders ?? $existing['genders'] ?? ['Caballero', 'Dama'],
        ];

        Storage::disk('local')->put(
            $this->configPath,
            json_encode($config, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)
        );

        if (!$request->expectsJson() && !$request->is('api/*')) {
            return back()->with('success', 'Configuración del builder actualizada correctamente.');
        }

        return response()->json(['message' => 'Guardado correctamente.', 'config' => $config]);
    }

    private function loadConfig(): array
    {
        if (!Storage::disk('local')->exists($this->configPath)) {
            $defaultConfig = [
                'products' => [
                    [
                        'id' => 'hoodie',
                        'name' => 'Hoodie Premium',
                        'basePrice' => 35,
                        'enabled' => true,
                        'variants' => [
                            'Caballero' => [
                                'enabled' => true,
                                'assets' => [
                                    'front' => '/images/custom_design_builder/hoodie_sin_fondo_front.png',
                                    'back'  => '/images/custom_design_builder/hoodie_sin_fondo_back.png',
                                ],
                                'colors' => [
                                    ['label' => 'Negro',       'value' => '#1A1A1A', 'enabled' => true],
                                    ['label' => 'Blanco',      'value' => '#FFFFFF', 'enabled' => true],
                                    ['label' => 'Verde Bosque','value' => '#0B3022', 'enabled' => true],
                                    ['label' => 'Gris Carbon', 'value' => '#4A4A4A', 'enabled' => true],
                                    ['label' => 'Azul Marino', 'value' => '#1F2640', 'enabled' => true],
                                    ['label' => 'Rojo Vino',   'value' => '#6B1B1B', 'enabled' => false],
                                ],
                                'sizes' => ['S', 'M', 'L', 'XL', '2XL'],
                            ],
                            'Dama' => [
                                'enabled' => true,
                                'assets' => [
                                    'front' => '/images/custom_design_builder/hoodie_sin_fondo_front.png',
                                    'back'  => '/images/custom_design_builder/hoodie_sin_fondo_back.png',
                                ],
                                'colors' => [
                                    ['label' => 'Negro',       'value' => '#1A1A1A', 'enabled' => true],
                                    ['label' => 'Blanco',      'value' => '#FFFFFF', 'enabled' => true],
                                    ['label' => 'Beige',       'value' => '#D5BEA4', 'enabled' => true],
                                    ['label' => 'Verde Bosque','value' => '#0B3022', 'enabled' => true],
                                    ['label' => 'Oliva',       'value' => '#556B2F', 'enabled' => false],
                                ],
                                'sizes' => ['XS', 'S', 'M', 'L', 'XL'],
                            ],
                        ],
                    ],
                    [
                        'id' => 'oversize',
                        'name' => 'T-Shirt Oversize',
                        'basePrice' => 20,
                        'enabled' => true,
                        'variants' => [
                            'Caballero' => [
                                'enabled' => true,
                                'assets' => [
                                    'front' => '/images/custom_design_builder/franela_blanca_sin_fondo.png',
                                    'back'  => '/images/custom_design_builder/franela_blanca_sin_fondo_back.png',
                                ],
                                'colors' => [
                                    ['label' => 'Blanco',      'value' => '#FFFFFF', 'enabled' => true],
                                    ['label' => 'Negro',       'value' => '#1A1A1A', 'enabled' => true],
                                    ['label' => 'Beige',       'value' => '#D5BEA4', 'enabled' => true],
                                    ['label' => 'Verde Bosque','value' => '#0B3022', 'enabled' => true],
                                    ['label' => 'Gris Carbon', 'value' => '#4A4A4A', 'enabled' => false],
                                ],
                                'sizes' => ['S', 'M', 'L', 'XL', '2XL', '3XL'],
                            ],
                            'Dama' => [
                                'enabled' => true,
                                'assets' => [
                                    'front' => '/images/custom_design_builder/franela_blanca_sin_fondo.png',
                                    'back'  => '/images/custom_design_builder/franela_blanca_sin_fondo_back.png',
                                ],
                                'colors' => [
                                    ['label' => 'Blanco', 'value' => '#FFFFFF', 'enabled' => true],
                                    ['label' => 'Negro',  'value' => '#1A1A1A', 'enabled' => true],
                                    ['label' => 'Beige',  'value' => '#D5BEA4', 'enabled' => true],
                                    ['label' => 'Oliva',  'value' => '#556B2F', 'enabled' => true],
                                ],
                                'sizes' => ['XS', 'S', 'M', 'L', 'XL'],
                            ],
                        ],
                    ],
                ],
                'fonts' => [
                    ['label' => 'Montserrat',       'value' => 'Montserrat, sans-serif'],
                    ['label' => 'Bebas Neue',       'value' => 'Bebas Neue, sans-serif'],
                    ['label' => 'Caveat',           'value' => 'Caveat, cursive'],
                    ['label' => 'Playfair Display', 'value' => 'Playfair Display, serif'],
                ],
                'genders' => ['Caballero', 'Dama'],
            ];

            // Auto-create file on VPS if it doesn't exist
            Storage::disk('local')->put(
                $this->configPath,
                json_encode($defaultConfig, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)
            );

            return $defaultConfig;
        }

        $content = Storage::disk('local')->get($this->configPath);
        // Strip UTF-8 BOM if present (common when file is written by Windows tools)
        $content = ltrim($content, "\xef\xbb\xbf");
        return json_decode($content, true) ?? [];
    }
}
