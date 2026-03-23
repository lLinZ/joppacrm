<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClientController extends Controller
{
    public function index()
    {
        $clients = Client::latest()->get();

        return Inertia::render('Clients/Index', [
            'clients' => $clients,
        ]);
    }

    public function show(Client $client)
    {
        // Query orders associated with this client's email or phone
        $ordersQuery = \App\Models\Order::query();
        
        $ordersQuery->where(function($q) use ($client) {
            if ($client->email) {
                $q->orWhere('email', $client->email);
            }
            if ($client->phone) {
                $q->orWhere('phone', $client->phone);
            }
        });

        // Ensure we don't query accidentally all if both are null
        if (!$client->email && !$client->phone) {
            $orders = [];
        } else {
            $orders = $ordersQuery->with('items.catalogProduct')
                                  ->orderByDesc('created_at')
                                  ->get();
        }

        return response()->json([
            'client' => $client,
            'orders' => $orders
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $validated['name'] = ucwords(mb_strtolower($validated['name'], 'UTF-8'));
        
        if (!empty($validated['email'])) {
            $validated['email'] = mb_strtolower($validated['email'], 'UTF-8');
        }
        
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

        Client::create($validated);

        return redirect()->back()->with('success', 'Cliente creado exitosamente.');
    }

    public function update(Request $request, Client $client)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $validated['name'] = ucwords(mb_strtolower($validated['name'], 'UTF-8'));
        
        if (!empty($validated['email'])) {
            $validated['email'] = mb_strtolower($validated['email'], 'UTF-8');
        }
        
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

        $client->update($validated);

        return redirect()->back()->with('success', 'Cliente actualizado exitosamente.');
    }

    public function destroy(Client $client)
    {
        $client->delete();

        return redirect()->back()->with('success', 'Cliente eliminado exitosamente.');
    }
}
