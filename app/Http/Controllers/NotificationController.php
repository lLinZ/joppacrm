<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $filter = $request->query('filter') === 'unread' ? 'unread' : 'all';

        $query = $filter === 'unread'
            ? $request->user()->unreadNotifications()
            : $request->user()->notifications();

        $notifications = $query->paginate(30)->withQueryString();

        return Inertia::render('Notifications/Index', [
            'notifications' => $notifications,
            'filter'        => $filter,
            'unreadCount'   => $request->user()->unreadNotifications()->count(),
        ]);
    }

    public function open(Request $request, string $id)
    {
        $notification = $request->user()->notifications()->where('id', $id)->first();

        if ($notification) {
            $notification->markAsRead();
            $url = $this->targetUrl((array) $notification->data);
            if ($url) {
                return redirect($url);
            }
        }

        return back();
    }

    public function markAllRead(Request $request)
    {
        $request->user()->unreadNotifications->markAsRead();

        return back();
    }

    /**
     * Resuelve a dónde debe llevar cada notificación según su tipo.
     */
    private function targetUrl(array $data): ?string
    {
        return match (true) {
            isset($data['seamstress_application_id']) => '/seamstress-applications/' . $data['seamstress_application_id'],
            isset($data['design_request_id'])         => '/design-requests/' . $data['design_request_id'],
            isset($data['order_id'])                  => '/orders/' . $data['order_id'],
            isset($data['product_id'])                => route('reviews.index'),
            default                                   => null,
        };
    }
}
