<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\AbandonedDesign;
use Carbon\Carbon;

class AbandonedDesignController extends Controller
{
    public function index()
    {
        // Limit to designs updated in the last 30 days to keep it clean
        // We only care about designs that have actual JSON data and lasted more than 5 seconds
        $designs = AbandonedDesign::whereNotNull('design_data')
            ->where('duration_seconds', '>=', 5)
            ->where('last_active_at', '>=', Carbon::now()->subDays(30))
            ->orderBy('last_active_at', 'desc')
            ->paginate(50);

        return Inertia::render('Designs/Abandoned', [
            'abandonedDesigns' => $designs
        ]);
    }

    public function destroy($id)
    {
        $design = AbandonedDesign::findOrFail($id);
        $design->delete();

        return redirect()->back()->with('success', 'Diseño huérfano eliminado de la base de datos.');
    }
}
