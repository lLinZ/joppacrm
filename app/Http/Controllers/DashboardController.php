<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        $totalClients = \App\Models\Client::count();
        $totalSuppliers = \App\Models\Supplier::count();
        
        $inventoryCostValue = \App\Models\Product::selectRaw('SUM(quantity * cost) as total')->value('total') ?? 0;
        
        $currentMonthExpenses = \App\Models\Expense::whereMonth('date', now()->month)
                                ->whereYear('date', now()->year)
                                ->sum('amount');
                                
        $lowStockProducts = \App\Models\Product::whereRaw('quantity <= min_stock')->get();
        
        $totalWebViews = \App\Models\CatalogProduct::sum('views_count');

        return inertia('Dashboard', [
            'stats' => [
                'total_clients' => $totalClients,
                'total_suppliers' => $totalSuppliers,
                'inventory_value' => $inventoryCostValue,
                'monthly_expenses' => $currentMonthExpenses,
                'total_web_views' => $totalWebViews,
            ],
            'low_stock_products' => $lowStockProducts
        ]);
    }
}
