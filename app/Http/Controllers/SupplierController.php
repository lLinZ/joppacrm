<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SupplierController extends Controller
{
    public function index()
    {
        $suppliers = Supplier::with('category')->latest()->get();
        $categories = Category::where('type', 'supplier')->get();

        return Inertia::render('Suppliers/Index', [
            'suppliers' => $suppliers,
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'category_id' => 'nullable|exists:categories,id',
            'type' => 'nullable|string|max:100',
            'instagram' => 'nullable|string|max:100',
            'reliability' => 'nullable|integer|min:1|max:5',
            'wholesale_price' => 'nullable|string|max:255',
            'platform' => 'nullable|string|max:100',
            'last_purchase_notes' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        Supplier::create($validated);

        return redirect()->back()->with('success', 'Proveedor creado exitosamente.');
    }

    public function update(Request $request, Supplier $supplier)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'category_id' => 'nullable|exists:categories,id',
            'type' => 'nullable|string|max:100',
            'instagram' => 'nullable|string|max:100',
            'reliability' => 'nullable|integer|min:1|max:5',
            'wholesale_price' => 'nullable|string|max:255',
            'platform' => 'nullable|string|max:100',
            'last_purchase_notes' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $supplier->update($validated);

        return redirect()->back()->with('success', 'Proveedor actualizado exitosamente.');
    }

    public function destroy(Supplier $supplier)
    {
        $supplier->delete();

        return redirect()->back()->with('success', 'Proveedor eliminado exitosamente.');
    }
}
