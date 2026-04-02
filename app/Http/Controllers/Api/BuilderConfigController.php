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
     * Only returns enabled items.
     */
    public function index()
    {
        $config = $this->loadConfig();

        // Filter only enabled items for the public API
        $publicConfig = [
            'colors' => collect($config['colors'] ?? [])
                ->filter(fn($c) => $c['enabled'] ?? true)
                ->map(fn($c) => ['label' => $c['label'], 'value' => $c['value']])
                ->values()
                ->toArray(),
            'sizes' => $config['sizes'] ?? ['S', 'M', 'L', 'XL'],
            'products' => collect($config['products'] ?? [])
                ->filter(fn($p) => $p['enabled'] ?? true)
                ->map(fn($p) => [
                    'id' => $p['id'],
                    'name' => $p['name'],
                    'basePrice' => $p['basePrice'],
                    'assets' => $p['assets'],
                ])
                ->values()
                ->toArray(),
            'fonts' => $config['fonts'] ?? [],
            'genders' => $config['genders'] ?? ['Caballero', 'Dama'],
        ];

        return response()->json($publicConfig);
    }

    /**
     * Admin endpoint: Returns the FULL configuration including disabled items.
     * Returns Inertia page or JSON depending on request context.
     */
    public function adminIndex(Request $request)
    {
        $config = $this->loadConfig();

        // If called from web (Inertia), render the page
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
        $validated = $request->validate([
            'colors' => 'required|array|min:1',
            'colors.*.label' => 'required|string|max:50',
            'colors.*.value' => 'required|string|max:10',
            'colors.*.enabled' => 'required|boolean',
            'sizes' => 'required|array|min:1',
            'sizes.*' => 'required|string|max:10',
            'products' => 'required|array|min:1',
            'products.*.id' => 'required|string|max:50',
            'products.*.name' => 'required|string|max:100',
            'products.*.basePrice' => 'required|numeric|min:0',
            'products.*.enabled' => 'required|boolean',
            'products.*.assets' => 'required|array',
            'fonts' => 'sometimes|array',
            'genders' => 'sometimes|array',
        ]);

        // Merge with defaults for optional fields
        $config = [
            'colors' => $validated['colors'],
            'sizes' => $validated['sizes'],
            'products' => $validated['products'],
            'fonts' => $validated['fonts'] ?? $this->loadConfig()['fonts'] ?? [],
            'genders' => $validated['genders'] ?? $this->loadConfig()['genders'] ?? ['Caballero', 'Dama'],
        ];

        Storage::disk('local')->put($this->configPath, json_encode($config, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        if (!$request->expectsJson() && !$request->is('api/*')) {
            return back()->with('success', 'Configuración del builder actualizada correctamente.');
        }

        return response()->json(['message' => 'Configuración guardada correctamente.', 'config' => $config]);
    }

    private function loadConfig(): array
    {
        if (!Storage::disk('local')->exists($this->configPath)) {
            return [
                'colors' => [
                    ['label' => 'Negro', 'value' => '#1A1A1A', 'enabled' => true],
                    ['label' => 'Blanco', 'value' => '#FFFFFF', 'enabled' => true],
                ],
                'sizes' => ['S', 'M', 'L', 'XL'],
                'products' => [],
                'fonts' => [],
                'genders' => ['Caballero', 'Dama'],
            ];
        }

        return json_decode(Storage::disk('local')->get($this->configPath), true) ?? [];
    }
}
