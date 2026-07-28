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
    Route::post('catalog-products/reorder', [\App\Http\Controllers\CatalogProductController::class, 'updateOrder'])->name('catalog-products.reorder');
    Route::post('catalog-products/{catalog_product}/toggle-featured', [\App\Http\Controllers\CatalogProductController::class, 'toggleFeatured'])->name('catalog-products.toggle-featured');
    Route::get('catalog-products/{catalog_product}/analytics', [\App\Http\Controllers\CatalogProductController::class, 'analytics'])->name('catalog-products.analytics');
    Route::resource('expenses', \App\Http\Controllers\ExpenseController::class);
    Route::resource('exchange-rates', \App\Http\Controllers\ExchangeRateController::class);
    Route::resource('orders', \App\Http\Controllers\OrderController::class)->only(['index', 'show']);
    Route::post('orders/{order}/status', [\App\Http\Controllers\OrderController::class, 'updateStatus'])->name('orders.updateStatus');
    Route::post('orders/{order}/complete', [\App\Http\Controllers\OrderController::class, 'complete'])->name('orders.complete');
    Route::post('orders/{order}/assign', [\App\Http\Controllers\OrderController::class, 'assign'])->name('orders.assign');
    Route::post('orders/{order}/call', [\App\Http\Controllers\OrderController::class, 'incrementCall'])->name('orders.incrementCall');
    Route::post('orders/{order}/comments', [\App\Http\Controllers\OrderController::class, 'storeComment'])->name('orders.comments.store');
    
    Route::get('/finance', [\App\Http\Controllers\FinanceController::class, 'index'])->name('finance.index');

    Route::post('design-requests/{design_request}/convert-to-order', [\App\Http\Controllers\DesignRequestController::class, 'convertToOrder'])->name('design-requests.convertToOrder');
    Route::post('design-requests/{design_request}/comments', [\App\Http\Controllers\DesignRequestController::class, 'storeComment'])->name('design-requests.comments.store');
    Route::resource('design-requests', \App\Http\Controllers\DesignRequestController::class)->only(['index', 'show', 'update', 'destroy']);
    
    // Postulaciones de costureras (recibidas desde /unete en el e-commerce)
    // Rutas GET específicas antes del resource para que no las capture {seamstress_application} de show
    Route::get('seamstress-applications/analytics', [\App\Http\Controllers\SeamstressApplicationController::class, 'analytics'])->name('seamstress-applications.analytics');
    Route::get('seamstress-applications/export', [\App\Http\Controllers\SeamstressApplicationController::class, 'export'])->name('seamstress-applications.export');
    Route::post('seamstress-applications/{seamstress_application}/send-email', [\App\Http\Controllers\SeamstressApplicationController::class, 'sendEmail'])->name('seamstress-applications.send-email');
    Route::resource('seamstress-applications', \App\Http\Controllers\SeamstressApplicationController::class)
        ->only(['index', 'show', 'update', 'destroy']);

    Route::get('/web-traffic', [\App\Http\Controllers\WebAnalyticsController::class, 'index'])->name('web.traffic');
    
    Route::resource('users', \App\Http\Controllers\UserController::class);

    // Reviews Moderation
    Route::get('reviews', [\App\Http\Controllers\Api\ReviewController::class, 'adminIndex'])->name('reviews.index');
    Route::post('reviews/{review}/status', [\App\Http\Controllers\Api\ReviewController::class, 'updateStatus'])->name('reviews.updateStatus');
    Route::delete('reviews/{review}', [\App\Http\Controllers\Api\ReviewController::class, 'destroy'])->name('reviews.destroy');

    // Notifications
    Route::get('/notifications', [\App\Http\Controllers\NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/mark-read', [\App\Http\Controllers\NotificationController::class, 'markAllRead'])->name('notifications.mark-read');
    Route::post('/notifications/{id}/open', [\App\Http\Controllers\NotificationController::class, 'open'])->name('notifications.open');

    // Suscripciones de notificaciones push (PWA)
    Route::get('/push-subscriptions', [\App\Http\Controllers\PushSubscriptionController::class, 'index'])->name('push-subscriptions.index');
    Route::post('/push-subscriptions', [\App\Http\Controllers\PushSubscriptionController::class, 'store'])->name('push-subscriptions.store');
    Route::delete('/push-subscriptions', [\App\Http\Controllers\PushSubscriptionController::class, 'destroy'])->name('push-subscriptions.destroy');
    Route::post('/push-subscriptions/test', [\App\Http\Controllers\PushSubscriptionController::class, 'test'])->name('push-subscriptions.test');

    // Tools
    Route::get('/tools/dtf-calculator', function () {
        return Inertia::render('Tools/DtfCalculator');
    })->name('tools.dtf-calculator');

    // Prueba de plantillas de correo
    Route::get('/tools/email-test', [\App\Http\Controllers\EmailTestController::class, 'index'])->name('tools.email-test');
    Route::post('/tools/email-test', [\App\Http\Controllers\EmailTestController::class, 'send'])->name('tools.email-test.send');

    // Builder Configuration for E-commerce
    Route::get('/settings/builder', [\App\Http\Controllers\Api\BuilderConfigController::class, 'adminIndex'])->name('settings.builder.index');
    Route::post('/settings/builder', [\App\Http\Controllers\Api\BuilderConfigController::class, 'update'])->name('settings.builder.update');

    // Builder Assets Manager
    Route::get('/settings/builder-assets', [\App\Http\Controllers\Api\BuilderAssetController::class, 'index'])->name('settings.builder-assets.index');
    Route::post('/settings/builder-assets', [\App\Http\Controllers\Api\BuilderAssetController::class, 'store'])->name('settings.builder-assets.store');
    Route::delete('/settings/builder-assets/{filename}', [\App\Http\Controllers\Api\BuilderAssetController::class, 'destroy'])->name('settings.builder-assets.destroy');

    // Abandoned Designs
    Route::get('/abandoned-designs', [\App\Http\Controllers\AbandonedDesignController::class, 'index'])->name('abandoned-designs.index');
    Route::delete('/abandoned-designs/{id}', [\App\Http\Controllers\AbandonedDesignController::class, 'destroy'])->name('abandoned-designs.destroy');
});

require __DIR__.'/auth.php';
