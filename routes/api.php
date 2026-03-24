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
});

Route::post('/design-requests', [\App\Http\Controllers\Api\DesignRequestController::class, 'store']);

// Web traffic heartbeat tracking
Route::post('/tracking/heartbeat', [\App\Http\Controllers\Api\TrackingController::class, 'heartbeat']);
