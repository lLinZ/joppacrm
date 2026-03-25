<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class WebAnalyticsController extends Controller
{
    public function index(\Illuminate\Http\Request $request)
    {
        $days = (int) $request->get('days', 7);
        $startDate = now()->subDays($days - 1)->startOfDay();

        $search = $request->get('search');
        $sortField = $request->get('sort', 'last_active_at');
        $sortDir = strtolower($request->get('dir', 'desc')) === 'asc' ? 'asc' : 'desc';

        $allowedSorts = ['visitor_id', 'ip_address', 'source', 'started_at', 'duration_seconds', 'entry_url', 'last_active_at'];
        if (!in_array($sortField, $allowedSorts)) {
            $sortField = 'last_active_at';
        }

        $query = \App\Models\WebTrafficSession::orderBy($sortField, $sortDir);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('visitor_id', 'like', "%{$search}%")
                  ->orWhere('ip_address', 'like', "%{$search}%")
                  ->orWhere('source', 'like', "%{$search}%")
                  ->orWhere('entry_url', 'like', "%{$search}%");
            });
        }

        $recentSessions = $query->paginate(15)
            ->withQueryString()
            ->through(function ($session) {
                return [
                    'id' => $session->id,
                    'visitor_id' => substr($session->visitor_id, 0, 8) . '...',
                    'ip_address' => $session->ip_address,
                    'user_agent' => $session->user_agent,
                    'source' => $session->source,
                    'entry_url' => $session->entry_url,
                    'started_at' => $session->started_at->format('Y-m-d H:i:s'),
                    'duration_formatted' => floor(abs((int)$session->duration_seconds) / 60) . 'm ' . (abs((int)$session->duration_seconds) % 60) . 's',
                    'is_returning' => \App\Models\WebTrafficSession::where('visitor_id', $session->getRawOriginal('visitor_id'))
                        ->where('started_at', '<', $session->started_at)
                        ->exists(),
                ];
            });

        // Agrupar sesiones por día para la gráfica
        $sessionsDaily = \App\Models\WebTrafficSession::selectRaw('DATE(started_at) as date, count(*) as total, avg(duration_seconds) as avg_duration')
            ->where('started_at', '>=', $startDate)
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        $chartData = [];
        $totalSessions = 0;
        $totalDuration = 0;

        for ($i = $days - 1; $i >= 0; $i--) {
            $dateObj = now()->subDays($i);
            $dateStr = $dateObj->format('Y-m-d');
            
            $row = $sessionsDaily->firstWhere('date', $dateStr);
            $count = $row ? (int)$row->total : 0;
            $avgDur = $row ? (int)$row->avg_duration : 0;
            
            $chartData[] = [
                'display' => $dateObj->format('d/m'),
                'sessions' => $count,
                'avg_duration' => $avgDur
            ];
            
            $totalSessions += $count;
            $totalDuration += ($count * $avgDur);
        }

        $avgGlobalDuration = abs($totalSessions > 0 ? floor($totalDuration / $totalSessions) : 0);

        return inertia('Analytics/WebTraffic', [
            'metrics' => [
                'total_sessions' => $totalSessions,
                'avg_duration_formatted' => floor($avgGlobalDuration / 60) . 'm ' . ($avgGlobalDuration % 60) . 's',
                'days' => $days
            ],
            'chartData' => $chartData,
            'recentSessions' => $recentSessions,
        ]);
    }
}
