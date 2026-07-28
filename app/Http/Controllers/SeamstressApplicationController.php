<?php

namespace App\Http\Controllers;

use App\Models\SeamstressApplication;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SeamstressApplicationController extends Controller
{
    private const STATUS_LABELS = [
        'pending'   => 'Nueva',
        'reviewed'  => 'Revisada',
        'contacted' => 'Contactada',
        'hired'     => 'Contratada',
        'rejected'  => 'Descartada',
    ];

    public function index()
    {
        $applications = SeamstressApplication::latest()->paginate(50);

        return Inertia::render('SeamstressApplications/Index', [
            'applications' => $applications,
        ]);
    }

    public function analytics()
    {
        $apps = SeamstressApplication::orderBy('created_at')->get();

        $prices = $apps->pluck('price_per_piece')
            ->filter(fn ($p) => $p !== null)
            ->map(fn ($p) => (float) $p)
            ->values();

        // --- Tarjetas resumen ---
        $stats = [
            'total'            => $apps->count(),
            'with_price'       => $prices->count(),
            'avg_price'        => $prices->count() ? round($prices->avg(), 2) : null,
            'min_price'        => $prices->count() ? round($prices->min(), 2) : null,
            'max_price'        => $prices->count() ? round($prices->max(), 2) : null,
            'median_price'     => $this->median($prices->all()),
            'total_capacity'   => (int) $apps->sum('weekly_capacity'),
            'hired'            => $apps->where('status', 'hired')->count(),
        ];

        // --- Distribución por estado ---
        $byStatus = collect(self::STATUS_LABELS)->map(fn ($label, $key) => [
            'key'   => $key,
            'label' => $label,
            'value' => $apps->where('status', $key)->count(),
        ])->values();

        // --- Distribución por experiencia ---
        $byExperience = collect(SeamstressApplication::EXPERIENCE_LABELS)->map(fn ($label, $key) => [
            'label' => $label,
            'value' => $apps->where('experience_years', $key)->count(),
        ])->values();

        // --- Máquinas (cada postulante puede tener varias) ---
        $byMachine = collect(SeamstressApplication::MACHINE_LABELS)->map(function ($label, $key) use ($apps) {
            return [
                'label' => $label,
                'value' => $apps->filter(fn ($a) => in_array($key, $a->machines ?? []))->count(),
            ];
        })->values();

        // --- Top ubicaciones ---
        $byLocation = $apps->groupBy(fn ($a) => trim($a->location))
            ->map(fn ($group, $loc) => ['label' => $loc, 'value' => $group->count()])
            ->sortByDesc('value')
            ->take(8)
            ->values();

        // --- Origen del tráfico (utm_source) ---
        $bySource = $apps->groupBy(fn ($a) => $a->source ?: 'Directo / Orgánico')
            ->map(fn ($group, $src) => ['label' => $src, 'value' => $group->count()])
            ->sortByDesc('value')
            ->values();

        // --- Postulaciones por día (últimos 30 días) ---
        $timeline = [];
        $grouped = $apps->groupBy(fn ($a) => $a->created_at->format('Y-m-d'));
        for ($i = 29; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $timeline[] = [
                'display' => $date->format('d/m'),
                'value'   => $grouped->get($date->format('Y-m-d'), collect())->count(),
            ];
        }

        // --- Comparación de presupuestos por prospecto (solo quienes indicaron precio) ---
        $budgetComparison = $apps->filter(fn ($a) => $a->price_per_piece !== null)
            ->map(fn ($a) => [
                'id'       => $a->id,
                'name'     => $a->name,
                'price'    => (float) $a->price_per_piece,
                'capacity' => (int) ($a->weekly_capacity ?? 0),
                'status'   => self::STATUS_LABELS[$a->status] ?? $a->status,
            ])
            ->sortBy('price')
            ->values();

        // --- Fichas completas para debatir en vivo (fotos + notas de cada prospecto) ---
        $prospects = $apps->sortByDesc('created_at')->map(fn ($a) => [
            'id'            => $a->id,
            'name'          => $a->name,
            'email'         => $a->email,
            'phone'         => $a->phone,
            'location'      => $a->location,
            'price'         => $a->price_per_piece !== null ? (float) $a->price_per_piece : null,
            'capacity'      => $a->weekly_capacity,
            'experience'    => SeamstressApplication::EXPERIENCE_LABELS[$a->experience_years] ?? null,
            'machines'      => collect($a->machines ?? [])
                                ->map(fn ($m) => SeamstressApplication::MACHINE_LABELS[$m] ?? $m)
                                ->values(),
            'status'        => $a->status,
            'status_label'  => self::STATUS_LABELS[$a->status] ?? $a->status,
            'photos'        => $a->photos ?? [],
            'message'       => $a->message,
            'budget_notes'  => $a->budget_notes,
            'admin_notes'   => $a->admin_notes,
            'created_at'    => $a->created_at->format('d/m/Y'),
        ])->values();

        return Inertia::render('SeamstressApplications/Analytics', [
            'stats'            => $stats,
            'byStatus'         => $byStatus,
            'byExperience'     => $byExperience,
            'byMachine'        => $byMachine,
            'byLocation'       => $byLocation,
            'bySource'         => $bySource,
            'timeline'         => $timeline,
            'budgetComparison' => $budgetComparison,
            'prospects'        => $prospects,
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $status = $request->query('status');

        $query = SeamstressApplication::query();
        if ($status && array_key_exists($status, self::STATUS_LABELS)) {
            $query->where('status', $status);
        }
        // Ordenado por tarifa para que sirva de comparación de presupuestos
        $apps = $query->orderByRaw('price_per_piece IS NULL, price_per_piece ASC')->get();

        $filename = 'presupuestos-costureras-' . now()->format('Y-m-d') . '.csv';

        $headers = [
            'Content-Type'        => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Pragma'              => 'no-cache',
            'Cache-Control'       => 'no-store, no-cache, must-revalidate',
        ];

        $columns = [
            'ID', 'Nombre', 'Ubicación', 'Email', 'Teléfono', 'Experiencia',
            'Máquinas', 'Capacidad semanal (piezas)', 'Precio por pieza (USD)',
            'Detalle presupuesto', 'Mensaje', 'Estado', 'Origen', 'Fecha',
        ];

        return response()->stream(function () use ($apps, $columns) {
            $out = fopen('php://output', 'w');

            // BOM UTF-8 para que Excel muestre bien los acentos
            fwrite($out, "\xEF\xBB\xBF");

            // ';' como separador: Excel en español lo abre en columnas al doble clic
            fputcsv($out, $columns, ';');

            foreach ($apps as $a) {
                $machines = collect($a->machines ?? [])
                    ->map(fn ($m) => SeamstressApplication::MACHINE_LABELS[$m] ?? $m)
                    ->implode(', ');

                fputcsv($out, [
                    $a->id,
                    $a->name,
                    $a->location,
                    $a->email,
                    $a->phone,
                    SeamstressApplication::EXPERIENCE_LABELS[$a->experience_years] ?? '',
                    $machines,
                    $a->weekly_capacity ?? '',
                    $a->price_per_piece !== null ? number_format((float) $a->price_per_piece, 2, '.', '') : '',
                    $a->budget_notes ?? '',
                    $a->message ?? '',
                    self::STATUS_LABELS[$a->status] ?? $a->status,
                    $a->source ?? 'Directo / Orgánico',
                    $a->created_at->format('Y-m-d H:i'),
                ], ';');
            }

            fclose($out);
        }, 200, $headers);
    }

    public function show(SeamstressApplication $seamstressApplication)
    {
        return Inertia::render('SeamstressApplications/Show', [
            'application' => $seamstressApplication,
        ]);
    }

    public function update(Request $request, SeamstressApplication $seamstressApplication)
    {
        $validated = $request->validate([
            'status'      => 'sometimes|in:pending,reviewed,contacted,hired,rejected',
            'admin_notes' => 'sometimes|nullable|string',
        ]);

        $seamstressApplication->update($validated);

        return back()->with('success', 'Postulación actualizada.');
    }

    public function destroy(SeamstressApplication $seamstressApplication)
    {
        $seamstressApplication->delete();

        return redirect()->route('seamstress-applications.index')->with('success', 'Postulación eliminada.');
    }

    private function median(array $values): ?float
    {
        if (empty($values)) {
            return null;
        }
        sort($values);
        $count = count($values);
        $mid = intdiv($count, 2);

        $median = $count % 2 === 0
            ? ($values[$mid - 1] + $values[$mid]) / 2
            : $values[$mid];

        return round($median, 2);
    }
}
