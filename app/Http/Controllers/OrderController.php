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
        $order->load(['items.catalogProduct.inventoryProduct', 'assignedUser', 'comments.user', 'activities.user']);
        
        // Sort activities by most recent inside the array if needed, or rely on relationship sort
        $order->setRelation('activities', $order->activities->sortByDesc('created_at')->values());
        
        return response()->json([
            'order' => $order
        ]);
    }

    /**
     * Update the status of the order.
     */
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
        }

        broadcast(new OrderUpdated($order->fresh()))->toOthers();

        return redirect()->back()->with('success', 'Status de la orden actualizado.');
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
