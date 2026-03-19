<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::with(['category', 'supplier'])->latest()->get();
        $categories = Category::where('type', 'product')->get();
        $suppliers = Supplier::all();

        return Inertia::render('Inventory/Index', [
            'products' => $products,
            'categories' => $categories,
            'suppliers' => $suppliers,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'style' => 'nullable|string|max:100',
            'fabric_type' => 'nullable|string|max:100',
            'size_s' => 'required|integer|min:0',
            'size_m' => 'required|integer|min:0',
            'size_l' => 'required|integer|min:0',
            'quantity' => 'required|integer|min:0',
            'min_stock' => 'required|integer|min:0',
            'price' => 'required|numeric|min:0',
            'cost' => 'required|numeric|min:0',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'category_id' => 'nullable|exists:categories,id',
        ]);

        Product::create($validated);

        return redirect()->back()->with('success', 'Producto agregado exitosamente.');
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'style' => 'nullable|string|max:100',
            'fabric_type' => 'nullable|string|max:100',
            'size_s' => 'required|integer|min:0',
            'size_m' => 'required|integer|min:0',
            'size_l' => 'required|integer|min:0',
            'quantity' => 'required|integer|min:0',
            'min_stock' => 'required|integer|min:0',
            'price' => 'required|numeric|min:0',
            'cost' => 'required|numeric|min:0',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'category_id' => 'nullable|exists:categories,id',
        ]);

        $product->update($validated);

        return redirect()->back()->with('success', 'Producto actualizado exitosamente.');
    }

    public function destroy(Product $product)
    {
        $product->delete();

        return redirect()->back()->with('success', 'Producto eliminado exitosamente.');
    }
}
