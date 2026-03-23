<?php

namespace App\Http\Controllers;

use App\Models\Collection;
use App\Models\CatalogProduct;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CollectionController extends Controller
{
    public function index()
    {
        $collections = Collection::with('catalogProducts:id')
            ->withCount('catalogProducts')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        $allProducts = CatalogProduct::select('id', 'name', 'price', 'is_published')
            ->orderBy('name')
            ->get();

        return Inertia::render('Collections/Index', [
            'collections' => $collections,
            'allProducts' => $allProducts,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active'   => 'boolean',
            'sort_order'  => 'integer',
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        Collection::create($validated);

        return redirect()->back()->with('success', 'Colección creada exitosamente.');
    }

    public function update(Request $request, Collection $collection)
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active'   => 'boolean',
            'sort_order'  => 'integer',
        ]);

        $validated['slug'] = Str::slug($validated['name']);
        $collection->update($validated);

        return redirect()->back()->with('success', 'Colección actualizada.');
    }

    public function destroy(Collection $collection)
    {
        $collection->delete();
        return redirect()->back()->with('success', 'Colección eliminada.');
    }

    /**
     * Sync (replace) all products attached to a collection.
     * Receives: { product_ids: [1, 3, 7, ...] }
     */
    public function syncProducts(Request $request, Collection $collection)
    {
        $validated = $request->validate([
            'product_ids'   => 'present|array',
            'product_ids.*' => 'integer|exists:catalog_products,id',
        ]);

        $collection->catalogProducts()->sync($validated['product_ids']);

        return redirect()->back()->with('success', 'Productos de la colección actualizados.');
    }
}
