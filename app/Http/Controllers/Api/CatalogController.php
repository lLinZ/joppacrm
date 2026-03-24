<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Collection;
use App\Models\CatalogProduct;
use Illuminate\Http\Request;

class CatalogController extends Controller
{
    /**
     * Return all active catalog products with their collections.
     */
    public function index(Request $request)
    {
        $query = CatalogProduct::with(['collections'])
            ->where('is_published', true)
            ->orderBy('catalog_order')
            ->orderBy('name');

        // Filter by collection slug
        if ($request->has('collection') && $request->collection) {
            $query->whereHas('collections', function ($q) use ($request) {
                $q->where('slug', $request->collection)
                  ->where('is_active', true);
            });
        }

        // Search by name
        if ($request->has('search') && $request->search) {
            $term = '%' . $request->search . '%';
            $query->where('name', 'like', $term);
        }

        return response()->json([
            'products' => $query->get(),
        ]);
    }

    /**
     * Return active collections for the catalog page chips.
     */
    public function collections()
    {
        $collections = Collection::where('is_active', true)
            ->whereHas('catalogProducts', fn($q) => $q->where('is_published', true))
            ->withCount(['catalogProducts' => fn($q) => $q->where('is_published', true)])
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return response()->json(['collections' => $collections]);
    }

    /**
     * Return a single catalog product.
     */
    public function show($identifier)
    {
        $product = CatalogProduct::where('slug', $identifier)->orWhere('id', $identifier)->first();
        
        if (!$product || !$product->is_published) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $product->load(['collections']);

        return response()->json(['product' => $product]);
    }

    /**
     * Increment the views count for a product.
     */
    public function incrementView($identifier)
    {
        $product = CatalogProduct::where('slug', $identifier)->orWhere('id', $identifier)->first();
        
        if ($product) {
            $product->increment('views_count');
            return response()->json(['message' => 'View recorded']);
        }

        return response()->json(['message' => 'Not found'], 404);
    }
}
