<?php

namespace App\Http\Controllers;

use App\Models\ExchangeRate;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExchangeRateController extends Controller
{
    public function index()
    {
        $rates = ExchangeRate::all();
        $histories = \App\Models\ExchangeRateHistory::with('exchangeRate')->latest()->get();
        return Inertia::render('Settings/ExchangeRates', [
            'rates' => $rates,
            'histories' => $histories,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'currency' => 'required|string|max:50',
            'rate' => 'required|numeric|min:0',
        ]);

        $rate = ExchangeRate::create($validated);
        $rate->histories()->create(['rate' => $validated['rate']]);
        return redirect()->back()->with('success', 'Tasa registrada exitosamente.');
    }

    public function update(Request $request, ExchangeRate $exchange_rate)
    {
        $validated = $request->validate([
            'currency' => 'required|string|max:50',
            'rate' => 'required|numeric|min:0',
        ]);

        $exchange_rate->update($validated);
        $exchange_rate->histories()->create(['rate' => $validated['rate']]);
        return redirect()->back()->with('success', 'Tasa actualizada.');
    }

    public function destroy(ExchangeRate $exchange_rate)
    {
        $exchange_rate->delete();
        return redirect()->back();
    }
}
