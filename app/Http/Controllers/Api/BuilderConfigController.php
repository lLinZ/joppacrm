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
            return [
                'products' => [],
                'fonts'    => [],
                'genders'  => ['Caballero', 'Dama'],
            ];
        }

        return json_decode(Storage::disk('local')->get($this->configPath), true) ?? [];
    }
}
