<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\User;
use App\Events\OrderUpdated;
use App\Events\OrderCommented;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderController extends Controller
{
    /**
     * Display a listing of the orders.
     */
    public function index(Request $request)
    {
        $query = Order::with(['assignedUser', 'items']);

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('search') && $request->search) {
            $searchTerm = '%' . $request->search . '%';
            $query->where(function($q) use ($searchTerm) {
                $q->where('name', 'like', $searchTerm)
                  ->orWhere('email', 'like', $searchTerm)
                  ->orWhere('id', 'like', $searchTerm);
            });
        }

        $orders = $query->orderBy('created_at', 'desc')->get();
        
        $users = User::select('id', 'name', 'email')->get();

        return Inertia::render('Orders/Index', [
            'orders' => $orders,
            'users' => $users,
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Order $order)
    {
        $order->load(['items.catalogProduct.inventoryProduct', 'assignedUser', 'comments.user', 'activities.user', 'costs']);
        
        // Sort activities by most recent inside the array if needed, or rely on relationship sort
        $order->setRelation('activities', $order->activities->sortByDesc('created_at')->values());
        
        return response()->json([
            'order' => $order
        ]);
    }

    public function updateStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => 'required|string',
        ]);

        $oldStatus = $order->status;
        $order->update(['status' => $validated['status']]);

        if ($oldStatus !== $validated['status']) {
            \App\Models\OrderActivity::create([
                'order_id' => $order->id,
                'user_id' => auth()->id(),
                'action' => 'status_changed',
                'old_value' => $oldStatus,
                'new_value' => $validated['status'],
                'description' => 'Cambió el status de la orden'
            ]);

            // Revert inventory if order was delivered and now is not
            if ($oldStatus === 'delivered' && $validated['status'] !== 'delivered') {
                foreach ($order->items as $item) {
                    if ($item->catalogProduct && $item->catalogProduct->inventoryProduct) {
                        $invProduct = $item->catalogProduct->inventoryProduct;
                        $qty = $item->quantity;
                        $invProduct->increment('quantity', $qty);
                        
                        $size = strtolower($item->size);
                        if (in_array($size, ['s', 'small'])) $invProduct->increment('size_s', $qty);
                        if (in_array($size, ['m', 'medium'])) $invProduct->increment('size_m', $qty);
                        if (in_array($size, ['l', 'large'])) $invProduct->increment('size_l', $qty);

                        \App\Models\InventoryMovement::create([
                            'product_id' => $invProduct->id,
                            'quantity' => $qty,
                            'type' => 'restock',
                            'size' => $item->size,
                            'reference_id' => $order->id,
                            'notes' => 'Status revertido (Orden #' . $order->id . ')',
                        ]);
                    }
                }
            }
        }

        broadcast(new OrderUpdated($order->fresh()))->toOthers();

        return redirect()->back()->with('success', 'Status de la orden actualizado.');
    }

    /**
     * Complete the order by providing cost breakdown.
     */
    public function complete(Request $request, Order $order)
    {
        $validated = $request->validate([
            'base_cost' => 'required|numeric|min:0',
            'print_cost' => 'required|numeric|min:0',
            'logistics_cost' => 'required|numeric|min:0',
            'delivery_cost' => 'required|numeric|min:0',
            'other_costs' => 'required|numeric|min:0',
        ]);

        $total_cost = $validated['base_cost'] + $validated['print_cost'] + $validated['logistics_cost'] + $validated['delivery_cost'] + $validated['other_costs'];
        $revenue = $order->total_amount;
        $net_profit = $revenue - $total_cost;

        $order->costs()->updateOrCreate(
            ['order_id' => $order->id],
            [
                'revenue' => $revenue,
                'base_cost' => $validated['base_cost'],
                'print_cost' => $validated['print_cost'],
                'logistics_cost' => $validated['logistics_cost'],
                'delivery_cost' => $validated['delivery_cost'],
                'other_costs' => $validated['other_costs'],
                'total_cost' => $total_cost,
                'net_profit' => $net_profit,
            ]
        );

        $oldStatus = $order->status;
        if ($oldStatus !== 'delivered') {
            $order->update(['status' => 'delivered']);

            \App\Models\OrderActivity::create([
                'order_id' => $order->id,
                'user_id' => auth()->id(),
                'action' => 'status_changed',
                'old_value' => $oldStatus,
                'new_value' => 'delivered',
                'description' => 'Orden completada con registro de costos'
            ]);

            foreach ($order->items as $item) {
                if ($item->catalogProduct && $item->catalogProduct->inventoryProduct) {
                    $invProduct = $item->catalogProduct->inventoryProduct;
                    $qtyToDeduct = $item->quantity;

                    $invProduct->decrement('quantity', $qtyToDeduct);
                    
                    $size = strtolower($item->size);
                    if (in_array($size, ['s', 'small'])) $invProduct->decrement('size_s', $qtyToDeduct);
                    if (in_array($size, ['m', 'medium'])) $invProduct->decrement('size_m', $qtyToDeduct);
                    if (in_array($size, ['l', 'large'])) $invProduct->decrement('size_l', $qtyToDeduct);

                    \App\Models\InventoryMovement::create([
                        'product_id' => $invProduct->id,
                        'quantity' => -$qtyToDeduct,
                        'type' => 'sale',
                        'size' => $item->size,
                        'reference_id' => $order->id,
                        'notes' => 'Venta despachada (Orden #' . $order->id . ')',
                    ]);
                }
            }
        }

        broadcast(new OrderUpdated($order->fresh()))->toOthers();

        return redirect()->back()->with('success', 'Orden completada y costos registrados.');
    }

    /**
     * Assign a user to the order.
     */
    public function assign(Request $request, Order $order)
    {
        $validated = $request->validate([
            'assigned_user_id' => 'nullable|exists:users,id',
        ]);

        $oldUser = $order->assigned_user_id ? User::find($order->assigned_user_id)->name : 'Sin asignar';
        $newUser = $validated['assigned_user_id'] ? User::find($validated['assigned_user_id'])->name : 'Sin asignar';

        $order->update(['assigned_user_id' => $validated['assigned_user_id']]);

        if ($oldUser !== $newUser) {
            \App\Models\OrderActivity::create([
                'order_id' => $order->id,
                'user_id' => auth()->id(),
                'action' => 'assigned',
                'old_value' => $oldUser,
                'new_value' => $newUser,
                'description' => 'Agente asignado cambiado'
            ]);
        }

        broadcast(new OrderUpdated($order->fresh()))->toOthers();

        return redirect()->back()->with('success', 'Agente asignado exitosamente.');
    }

    /**
     * Increment the call count.
     */
    public function incrementCall(Order $order)
    {
        $order->increment('call_count');
        
        \App\Models\OrderActivity::create([
            'order_id' => $order->id,
            'user_id' => auth()->id(),
            'action' => 'call_registered',
            'description' => 'Llamada telefónica registrada'
        ]);

        broadcast(new OrderUpdated($order->fresh()))->toOthers();

        return redirect()->back()->with('success', 'Llamada registrada.');
    }

    /**
     * Store a comment for the order.
     */
    public function storeComment(Request $request, Order $order)
    {
        $validated = $request->validate([
            'body' => 'required|string',
        ]);

        $comment = $order->comments()->create([
            'user_id' => auth()->id(),
            'body' => $validated['body'],
        ]);

        broadcast(new OrderCommented($comment))->toOthers();

        return redirect()->back()->with('success', 'Comentario añadido.');
    }
}
