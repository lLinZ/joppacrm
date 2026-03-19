<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Expense;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExpenseController extends Controller
{
    public function index(Request $request)
    {
        $query = Expense::with(['category', 'supplier'])->latest();

        if ($request->has('start_date') && $request->has('end_date') && $request->start_date && $request->end_date) {
            $query->whereBetween('date', [$request->start_date, $request->end_date]);
        }

        $expenses = $query->get();
        $categories = Category::where('type', 'expense')->get();
        $suppliers = \App\Models\Supplier::all();
        $rates = \App\Models\ExchangeRate::all();

        return Inertia::render('Expenses/Index', [
            'expenses' => $expenses,
            'categories' => $categories,
            'suppliers' => $suppliers,
            'rates' => $rates,
            'filters' => $request->only(['start_date', 'end_date']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'description' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'date' => 'required|date',
            'category_id' => 'nullable|exists:categories,id',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'order_details' => 'nullable|string',
            'notes' => 'nullable|string',
            'currency' => 'required|string',
            'exchange_rate_value' => 'nullable|numeric|min:0',
        ]);

        Expense::create($validated);

        return redirect()->back()->with('success', 'Gasto registrado exitosamente.');
    }

    public function update(Request $request, Expense $expense)
    {
        $validated = $request->validate([
            'description' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'date' => 'required|date',
            'category_id' => 'nullable|exists:categories,id',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'order_details' => 'nullable|string',
            'notes' => 'nullable|string',
            'currency' => 'required|string',
            'exchange_rate_value' => 'nullable|numeric|min:0',
        ]);

        $expense->update($validated);

        return redirect()->back()->with('success', 'Gasto actualizado exitosamente.');
    }

    public function destroy(Expense $expense)
    {
        $expense->delete();

        return redirect()->back()->with('success', 'Gasto eliminado exitosamente.');
    }
}
