<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CatalogProduct;
use App\Models\CatalogProductReview;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /**
     * Get approved reviews for a product.
     */
    public function index($identifier)
    {
        $product = CatalogProduct::where('slug', $identifier)->orWhere('id', $identifier)->firstOrFail();
        
        $reviews = $product->reviews()
            ->approved()
            ->orderBy('created_at', 'desc')
            ->get();

        $stats = [
            'total' => $reviews->count(),
            'average' => $reviews->avg('rating') ?: 0,
            'breakdown' => [
                5 => $reviews->where('rating', 5)->count(),
                4 => $reviews->where('rating', 4)->count(),
                3 => $reviews->where('rating', 3)->count(),
                2 => $reviews->where('rating', 2)->count(),
                1 => $reviews->where('rating', 1)->count(),
            ]
        ];

        return response()->json([
            'reviews' => $reviews->makeHidden(['user_email']),
            'stats' => $stats
        ]);
    }

    /**
     * Submit a guest review.
     */
    public function store(Request $request, $identifier)
    {
        $product = CatalogProduct::where('slug', $identifier)->orWhere('id', $identifier)->firstOrFail();

        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string|min:3|max:1000',
            'user_name' => 'required|string|max:100',
            'user_email' => 'nullable|email|max:255',
        ]);

        $review = CatalogProductReview::create([
            'catalog_product_id' => $product->id,
            'rating' => $validated['rating'],
            'comment' => $validated['comment'],
            'user_name' => $validated['user_name'],
            'user_email' => $validated['user_email'],
            'status' => 'pending', // Requires admin approval
            'is_verified_purchase' => false,
        ]);

        return response()->json([
            'message' => '¡Gracias! Tu reseña ha sido enviada y está pendiente de moderación.',
            'review' => $review
        ], 201);
    }

    /**
     * Admin: Approve or Reject a review.
     */
    public function updateStatus(Request $request, CatalogProductReview $review)
    {
        $validated = $request->validate([
            'status' => 'required|in:approved,rejected,pending',
            'is_verified_purchase' => 'boolean',
        ]);

        $review->update($validated);

        return back()->with('success', 'Estado de la reseña actualizado.');
    }

    /**
     * Admin: Delete a review.
     */
    public function destroy(CatalogProductReview $review)
    {
        $review->delete();
        return back()->with('success', 'Reseña eliminada.');
    }
}
