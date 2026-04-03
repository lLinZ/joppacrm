<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderCost;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class FinanceController extends Controller
{
    public function index(Request $request)
    {
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', Carbon::now()->endOfMonth()->toDateString());

        // Get costs for orders within the date range
        $costs = OrderCost::with('order.items')->whereHas('order', function ($query) use ($startDate, $endDate) {
            $query->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59']);
        })->get();

        $metrics = [
            'revenue' => collect($costs)->sum('revenue'),
            'total_cost' => collect($costs)->sum('total_cost'),
            'base_cost' => collect($costs)->sum('base_cost'),
            'print_cost' => collect($costs)->sum('print_cost'),
            'logistics_cost' => collect($costs)->sum('logistics_cost'),
            'delivery_cost' => collect($costs)->sum('delivery_cost'),
            'other_costs' => collect($costs)->sum('other_costs'),
            'net_profit' => collect($costs)->sum('net_profit'),
            'total_orders' => collect($costs)->count(),
        ];

        return Inertia::render('Finance/Index', [
            'metrics' => $metrics,
            'costsList' => $costs,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ]
        ]);
    }
}
