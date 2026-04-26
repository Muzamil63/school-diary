<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * Round-Robin Load Balancing Simulation
 *
 * In a real multi-server deployment, a hardware or software load balancer
 * (e.g. Nginx, HAProxy, AWS ALB) sits in front of multiple Laravel instances.
 * This service simulates that concept in code for demonstration purposes.
 *
 * Architecture:
 *   [Client Browser]
 *        │
 *        ▼
 *   [Nginx / HAProxy  ← Load Balancer]
 *        │  round-robin  │
 *        ▼               ▼
 *  [Laravel Server 1] [Laravel Server 2] ... [Laravel Server N]
 *        │               │
 *        └───────┬───────┘
 *                ▼
 *         [MySQL (primary) + Redis (cache/queue)]
 */
class LoadBalancerService
{
    /** Backend server pool (would come from config/env in production) */
    private array $servers = [
        ['id' => 1, 'host' => 'api-server-1.school.internal', 'port' => 8001, 'weight' => 1],
        ['id' => 2, 'host' => 'api-server-2.school.internal', 'port' => 8002, 'weight' => 1],
        ['id' => 3, 'host' => 'api-server-3.school.internal', 'port' => 8003, 'weight' => 1],
    ];

    private string $cacheKey = 'lb_round_robin_index';

    /**
     * Select the next backend server using atomic round-robin.
     * The index is stored in Redis/Cache so all instances share state.
     */
    public function nextServer(): array
    {
        $activeServers = $this->getActiveServers();

        if (empty($activeServers)) {
            throw new \RuntimeException('No backend servers are available.');
        }

        // Atomically increment the counter and wrap around the pool size
        $index = Cache::increment($this->cacheKey);
        $server = $activeServers[($index - 1) % count($activeServers)];

        Log::debug("LoadBalancer: routing request to server #{$server['id']} ({$server['host']})");

        return $server;
    }

    /**
     * Return only servers that pass a health check (ping).
     * In production this would be replaced by a real health-check probe.
     */
    public function getActiveServers(): array
    {
        return Cache::remember('lb_active_servers', 30, function () {
            return array_filter($this->servers, fn($s) => $this->isHealthy($s));
        });
    }

    /**
     * Simulated health check — in production this performs a real HTTP HEAD
     * or TCP connection to the server.
     */
    private function isHealthy(array $server): bool
    {
        // Simulation: all servers are healthy
        return true;
    }

    /**
     * Return a status report of the server pool.
     */
    public function getStatus(): array
    {
        return array_map(fn($s) => [
            ...$s,
            'healthy'  => $this->isHealthy($s),
            'endpoint' => "http://{$s['host']}:{$s['port']}/api",
        ], $this->servers);
    }
}
