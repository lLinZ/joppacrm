<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\CatalogController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
Route::post('/orders', [OrderController::class, 'store']);

// Public catalog API (consumed by joppa-ecommerce)
Route::prefix('catalog')->group(function () {
    Route::get('/', [CatalogController::class, 'index']);
    Route::get('/collections', [CatalogController::class, 'collections']);
    Route::get('/{product}', [CatalogController::class, 'show']);
    Route::post('/{id}/view', [CatalogController::class, 'incrementView']);
    Route::get('/sitemap-data', [CatalogController::class, 'sitemap']);
});

Route::post('/design-requests', [\App\Http\Controllers\Api\DesignRequestController::class, 'store']);
Route::post('/design-assets', [\App\Http\Controllers\Api\DesignRequestController::class, 'uploadAsset']);
Route::post('/contact-messages', [\App\Http\Controllers\Api\ContactMessageController::class, 'store']);

// Web traffic heartbeat tracking
Route::post('/tracking/heartbeat', [\App\Http\Controllers\Api\TrackingController::class, 'heartbeat']);

// Anonymous WebSocket Auth for Store Visitors
Route::post('/broadcasting/auth', function (Request $request) {
    if (!$request->has('visitor_id')) {
        abort(403, 'Visitor ID required');
    }

    $user = new \Illuminate\Auth\GenericUser([
        'id' => $request->visitor_id, 
        'name' => 'Visitante',
        'current_url' => $request->url ?? '/',
        'ip_address' => $request->ip(),
        'user_agent' => $request->header('User-Agent'),
        'source' => $request->source ?? 'Orgánico / Directo'
    ]);

    $request->setUserResolver(function () use ($user) {
        return $user;
    });

    return \Illuminate\Support\Facades\Broadcast::auth($request);
});
