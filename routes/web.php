<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', [\App\Http\Controllers\DashboardController::class, 'index'])->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::patch('/profile/theme', [ProfileController::class, 'updateTheme'])->name('profile.theme.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::resource('suppliers', \App\Http\Controllers\SupplierController::class);
    Route::resource('clients', \App\Http\Controllers\ClientController::class);
    Route::resource('products', \App\Http\Controllers\ProductController::class);
    Route::resource('collections', \App\Http\Controllers\CollectionController::class)->except(['show', 'create', 'edit']);
    Route::post('collections/{collection}/products', [\App\Http\Controllers\CollectionController::class, 'syncProducts'])->name('collections.syncProducts');
    Route::resource('catalog-products', \App\Http\Controllers\CatalogProductController::class)->except(['create', 'show']);
    Route::get('catalog-products/{catalog_product}/analytics', [\App\Http\Controllers\CatalogProductController::class, 'analytics'])->name('catalog-products.analytics');
    Route::resource('expenses', \App\Http\Controllers\ExpenseController::class);
    Route::resource('exchange-rates', \App\Http\Controllers\ExchangeRateController::class);
    Route::resource('orders', \App\Http\Controllers\OrderController::class)->only(['index', 'show']);
    Route::post('orders/{order}/status', [\App\Http\Controllers\OrderController::class, 'updateStatus'])->name('orders.updateStatus');
    Route::post('orders/{order}/assign', [\App\Http\Controllers\OrderController::class, 'assign'])->name('orders.assign');
    Route::post('orders/{order}/call', [\App\Http\Controllers\OrderController::class, 'incrementCall'])->name('orders.incrementCall');
    Route::post('orders/{order}/comments', [\App\Http\Controllers\OrderController::class, 'storeComment'])->name('orders.comments.store');
    
    Route::post('design-requests/{design_request}/convert-to-order', [\App\Http\Controllers\DesignRequestController::class, 'convertToOrder'])->name('design-requests.convertToOrder');
    Route::post('design-requests/{design_request}/comments', [\App\Http\Controllers\DesignRequestController::class, 'storeComment'])->name('design-requests.comments.store');
    Route::resource('design-requests', \App\Http\Controllers\DesignRequestController::class)->only(['index', 'show', 'update']);
    
    Route::get('/web-traffic', [\App\Http\Controllers\WebAnalyticsController::class, 'index'])->name('web.traffic');
    
    Route::resource('users', \App\Http\Controllers\UserController::class);
});

require __DIR__.'/auth.php';
