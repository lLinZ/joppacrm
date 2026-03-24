<?php

$request = \Illuminate\Http\Request::create('/api/broadcasting/auth', 'POST', [
    'channel_name' => 'presence-store',
    'socket_id' => '12345.6789',
    'visitor_id' => 'some-id',
    'url' => 'https://joppa.shop/'
]);

$user = new \Illuminate\Auth\GenericUser([
    'id' => 'some-id', 
    'name' => 'Visitante', 
    'current_url' => '/'
]);

$request->setUserResolver(function() use ($user) { 
    return $user; 
});

try {
    $res = \Illuminate\Support\Facades\Broadcast::auth($request);
    echo "SUCCESS:\n";
    if ($res instanceof \Illuminate\Http\Response || $res instanceof \Illuminate\Http\JsonResponse) {
        echo $res->getContent();
    } else {
        echo json_encode($res);
    }
} catch (\Exception $e) {
    echo "ERROR:\n" . $e->getMessage() . "\n";
    echo $e->getTraceAsString();
}
