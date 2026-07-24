<?php

namespace App\Http\Controllers;

use App\Models\SeamstressApplication;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SeamstressApplicationController extends Controller
{
    public function index()
    {
        $applications = SeamstressApplication::latest()->paginate(50);

        return Inertia::render('SeamstressApplications/Index', [
            'applications' => $applications,
        ]);
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
}
