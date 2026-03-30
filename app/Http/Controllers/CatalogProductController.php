<?php

namespace App\Http\Controllers;

use App\Models\CatalogProduct;
use App\Models\Collection;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class CatalogProductController extends Controller
{
    /**
     * Display a listing of the catalog products.
     */
    public function index()
    {
        $products = CatalogProduct::with('collections')
            ->orderBy('catalog_order')
            ->orderBy('name')
            ->get();

        return Inertia::render('CatalogProducts/Index', [
            'products' => $products,
        ]);
    }

    /**
     * Add a new independent catalog product.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
        ]);

        $product = CatalogProduct::create([
            'name' => $validated['name'],
            'price' => $validated['price'],
            'is_published' => false,
            'catalog_order' => 0,
        ]);

        return redirect()->route('catalog-products.edit', $product->id)->with('success', 'Producto de catálogo creado. Ahora puedes diseñar su apariencia.');
    }

    /**
     * Show the form for editing the catalog details of a product.
     */
    public function edit(CatalogProduct $catalog_product)
    {
        $collections = Collection::orderBy('name')->get();
        // Cargar productos de inventario para vinculación opcional
        $inventoryProducts = Product::select('id', 'name', 'sku')->orderBy('name')->get();
        
        $catalog_product->load(['collections', 'reviews' => function($q) {
            $q->orderBy('created_at', 'desc');
        }]);

        return Inertia::render('CatalogProducts/Edit', [
            'product' => $catalog_product,
            'collections' => $collections,
            'inventoryProducts' => $inventoryProducts,
        ]);
    }

    /**
     * Update the catalog details of a product.
     */
    public function update(Request $request, CatalogProduct $catalog_product)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:catalog_products,slug,' . $catalog_product->id,
            'price' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'product_information' => 'nullable|string',
            'product_features' => 'nullable|string',
            'product_design' => 'nullable|string',
            'available_colors' => 'nullable|array',
            'available_colors.*' => 'string',
            'available_sizes' => 'nullable|array',
            'available_sizes.*' => 'string',
            'available_genders' => 'nullable|array',
            'available_genders.*' => 'string',
            'is_published' => 'boolean',
            'inventory_product_id' => 'nullable|exists:products,id',
            'catalog_order' => 'integer',
            'collection_ids' => 'array',
            'collection_ids.*' => 'integer|exists:collections,id',
            'images' => 'nullable|array',
            'images.*' => 'url',
            'new_images' => 'nullable|array',
            'new_images.*' => 'image|max:10240', // Max 10MB per image
            'new_video' => 'nullable|mimes:mp4,mov,ogg,qt|max:20480', // Max 20MB
            'new_detail_image' => 'nullable|image|max:10240',
            'new_design_front' => 'nullable|image|max:10240',
            'new_design_back' => 'nullable|image|max:10240',
            'remove_video' => 'nullable|boolean',
            'remove_detail_image' => 'nullable|boolean',
        ]);

        $images = $request->input('images', []);

        // Upload new images
        if ($request->hasFile('new_images')) {
            foreach ($request->file('new_images') as $file) {
                $path = $file->store('catalog/gallery', 'public');
                $images[] = asset('storage/' . $path);
            }
        }

        $video_url = $catalog_product->video_url;
        if ($request->input('remove_video')) {
            $video_url = null;
        } elseif ($request->hasFile('new_video')) {
            $path = $request->file('new_video')->store('catalog/videos', 'public');
            $video_url = asset('storage/' . $path);
        }

        $detail_image_url = $catalog_product->detail_image_url;
        if ($request->input('remove_detail_image')) {
            $detail_image_url = null;
        } elseif ($request->hasFile('new_detail_image')) {
            $path = $request->file('new_detail_image')->store('catalog/details', 'public');
            $detail_image_url = asset('storage/' . $path);
        }

        $catalog_product->update([
            'name' => $validated['name'],
            'slug' => $validated['slug'] ?? \Illuminate\Support\Str::slug($validated['name']),
            'price' => $validated['price'],
            'description' => $validated['description'] ?? null,
            'product_information' => $validated['product_information'] ?? null,
            'product_features' => $validated['product_features'] ?? null,
            'product_design' => $this->processProductDesign(
                $validated['product_design'] ?? null,
                $request->file('new_design_front'),
                $request->file('new_design_back')
            ),
            'catalog_order' => $validated['catalog_order'] ?? 0,
            'available_colors' => $validated['available_colors'] ?? null,
            'available_sizes' => $validated['available_sizes'] ?? null,
            'available_genders' => $validated['available_genders'] ?? null,
            'is_published' => $validated['is_published'] ?? false,
            'inventory_product_id' => $validated['inventory_product_id'] ?? null,
            'images' => $images,
            'video_url' => $video_url,
            'detail_image_url' => $detail_image_url,
        ]);

        if (isset($validated['collection_ids'])) {
            $catalog_product->collections()->sync($validated['collection_ids']);
        } else {
            $catalog_product->collections()->detach();
        }

        return redirect()->route('catalog-products.edit', $catalog_product->id)->with('success', 'Detalles del catálogo actualizados correctamente.');
    }

    /**
     * Process and build the product_design JSON with new design uploads.
     */
    private function processProductDesign($existingJson, $frontFile, $backFile)
    {
        $design = null;
        if ($existingJson) {
            $design = json_decode($existingJson, true);
        }

        if (!$design) {
            $design = [
                'product' => ['id' => 'tshirt', 'name' => 'Franela'],
                'color' => '#FFFFFF',
                'elements' => ['front' => [], 'back' => []]
            ];
        }

        if ($frontFile) {
            $path = $frontFile->store('catalog/designs', 'public');
            $url = asset('storage/' . $path);
            
            // Reemplazar o añadir diseño frontal
            $design['elements']['front'] = [
                [
                    'id' => 'front-main-' . time(),
                    'type' => 'image',
                    'content' => $url,
                    'x' => 250,
                    'y' => 250,
                    'width' => 500,
                    'height' => 500,
                    'rotation' => 0
                ]
            ];
        }

        if ($backFile) {
            $path = $backFile->store('catalog/designs', 'public');
            $url = asset('storage/' . $path);
            
            // Reemplazar o añadir diseño posterior
            $design['elements']['back'] = [
                [
                    'id' => 'back-main-' . time(),
                    'type' => 'image',
                    'content' => $url,
                    'x' => 250,
                    'y' => 250,
                    'width' => 500,
                    'height' => 500,
                    'rotation' => 0
                ]
            ];
        }

        return json_encode($design);
    }

    /**
     * Remove the product from the catalog fully.
     */
    public function destroy(CatalogProduct $catalog_product)
    {
        $catalog_product->collections()->detach();
        $catalog_product->delete();

        return redirect()->route('catalog-products.index')->with('success', 'Producto borrado del catálogo.');
    }

    /**
     * Return time-series analytics for a specific catalog product.
     */
    public function analytics(CatalogProduct $catalog_product, Request $request)
    {
        $days = (int) $request->get('days', 30);
        $startDate = now()->subDays($days - 1)->startOfDay();

        $views = \Illuminate\Support\Facades\DB::table('catalog_product_views')
            ->selectRaw('DATE(created_at) as date, count(*) as unique_views')
            ->where('catalog_product_id', $catalog_product->id)
            ->where('created_at', '>=', $startDate)
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        // Fill missing days
        $data = [];
        for ($i = $days - 1; $i >= 0; $i--) {
            $dateObj = now()->subDays($i);
            $dateStr = $dateObj->format('Y-m-d');
            $displayDate = $dateObj->format('d/m');
            
            $row = $views->firstWhere('date', $dateStr);
            $data[] = [
                'date' => $dateStr,
                'display' => $displayDate,
                'views' => $row ? (int)$row->unique_views : 0,
            ];
        }

        return response()->json([
            'total_unique' => $catalog_product->unique_views_count,
            'total_raw' => $catalog_product->views_count,
            'chart_data' => $data,
        ]);
    }
}
