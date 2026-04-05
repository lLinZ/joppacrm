<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\DesignRequest;
use Inertia\Inertia;

class DesignRequestController extends Controller
{
    public function index()
    {
        $requests = DesignRequest::withCount('items')
            ->latest()
            ->paginate(20);

        return Inertia::render('DesignRequests/Index', [
            'requests' => $requests,
        ]);
    }

    public function show(DesignRequest $designRequest)
    {
        $designRequest->load(['items', 'comments.user']);
        $catalogProducts = \App\Models\CatalogProduct::all(['id', 'name', 'price']);

        return Inertia::render('DesignRequests/Show', [
            'request' => $designRequest,
            'catalogProducts' => $catalogProducts,
        ]);
    }

    public function update(Request $request, DesignRequest $designRequest)
    {
        $validated = $request->validate([
            'status' => 'sometimes|in:pending,reviewed,in_progress,accepted,rejected',
            'admin_notes' => 'sometimes|nullable|string',
        ]);

        $designRequest->update($validated);

        return back()->with('success', 'Solicitud actualizada.');
    }

    public function storeComment(Request $request, DesignRequest $designRequest)
    {
        $validated = $request->validate([
            'body' => 'required|string',
        ]);

        $designRequest->comments()->create([
            'user_id' => auth()->id(),
            'body' => $validated['body'],
        ]);

        return redirect()->back();
    }

    public function convertToOrder(Request $request, DesignRequest $designRequest)
    {
        $validated = $request->validate([
            'product_name' => 'required|string|max:255',
            'catalog_product_id' => 'nullable|exists:catalog_products,id',
            'custom_price' => 'required|numeric|min:0',
            'quantity' => 'required|integer|min:1',
        ]);

        $client = \App\Models\Client::where('email', $designRequest->email)->orWhere('phone', $designRequest->phone)->first();
        if ($client) {
            $client->update([
                'name' => $designRequest->name,
                'phone' => $designRequest->phone,
                'address' => $designRequest->state,
            ]);
        } else {
            \App\Models\Client::create([
                'name' => $designRequest->name,
                'email' => $designRequest->email,
                'phone' => $designRequest->phone,
                'address' => $designRequest->state,
            ]);
        }

        $order = \App\Models\Order::create([
            'name' => $designRequest->name,
            'email' => $designRequest->email,
            'phone' => $designRequest->phone,
            'address' => $designRequest->state,
            'total_amount' => $validated['custom_price'] * $validated['quantity'],
            'status' => 'pending',
        ]);

        $order->items()->create([
            'product_id' => $validated['catalog_product_id'] ?? null,
            'product_name' => $validated['product_name'],
            'quantity' => $validated['quantity'],
            'price' => $validated['custom_price'],
        ]);

        $designRequest->update(['status' => 'accepted']);

        return redirect()->route('orders.index')->with('success', 'Orden Formal Creada Exitosamente.');
    }
    public function destroy(DesignRequest $designRequest)
    {
        $designRequest->delete();

        return redirect()->route('design-requests.index')->with('success', 'Solicitud eliminada.');
    }
}
