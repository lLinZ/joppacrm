<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'total_amount' => 'required|numeric',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'nullable|string',
            'items.*.product_name' => 'required|string|max:255',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric',
        ]);

        // Normalize data
        $validated['name'] = ucwords(mb_strtolower($validated['name'], 'UTF-8'));
        $validated['email'] = mb_strtolower($validated['email'], 'UTF-8');
        
        if (!empty($validated['phone'])) {
            $hasPlus = str_starts_with(trim($validated['phone']), '+');
            $phone = preg_replace('/[^0-9]/', '', $validated['phone']);
            
            if ($hasPlus) {
                $validated['phone'] = '+' . $phone;
            } else {
                if (str_starts_with($phone, '0')) {
                    $phone = ltrim($phone, '0');
                    $validated['phone'] = '+58' . $phone;
                } elseif (str_starts_with($phone, '58')) {
                    $validated['phone'] = '+' . $phone;
                } else {
                    $validated['phone'] = '+58' . $phone;
                }
            }
        }

        // Auto-create or update client in the CRM (match by phone or email)
        $client = \App\Models\Client::where(function($q) use ($validated) {
            if (!empty($validated['phone'])) {
                $q->orWhere('phone', $validated['phone']);
            }
            if (!empty($validated['email'])) {
                $q->orWhere('email', $validated['email']);
            }
        })->first();

        if ($client) {
            $client->update([
                'name' => $validated['name'],
                'phone' => !empty($validated['phone']) ? $validated['phone'] : $client->phone,
                'email' => !empty($validated['email']) ? $validated['email'] : $client->email,
                'address' => !empty($validated['address']) ? $validated['address'] : $client->address,
            ]);
        } else {
            \App\Models\Client::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null,
                'address' => $validated['address'] ?? null,
            ]);
        }

        $order = \App\Models\Order::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'address' => $validated['address'],
            'total_amount' => $validated['total_amount'],
            'status' => 'pending',
        ]);

        foreach ($validated['items'] as $item) {
            
            if (!empty($item['product_id'])) {
                $catalogProduct = \App\Models\CatalogProduct::find($item['product_id']);
                if ($catalogProduct) {
                    $catalogProduct->increment('sales_count', $item['quantity']);
                }
            }

            $order->items()->create([
                'product_id' => $item['product_id'] ?? null,
                'product_name' => $item['product_name'],
                'quantity' => $item['quantity'],
                'price' => $item['price'],
            ]);
        }

        broadcast(new \App\Events\OrderCreated($order->fresh()))->toOthers();

        return response()->json([
            'message' => 'Order created successfully',
            'order' => $order->load(['items.catalogProduct'])
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
