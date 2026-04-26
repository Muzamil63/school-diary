<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function user_can_login_with_valid_credentials(): void
    {
        $user = User::factory()->create([
            'email'    => 'test@school.edu',
            'password' => bcrypt('password123'),
            'role'     => 'teacher',
            'status'   => 'active',
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email'    => 'test@school.edu',
            'password' => 'password123',
        ]);

        $response->assertOk()
                 ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email', 'role']]);
    }

    /** @test */
    public function login_fails_with_invalid_credentials(): void
    {
        $this->postJson('/api/auth/login', [
            'email'    => 'bad@school.edu',
            'password' => 'wrongpassword',
        ])->assertStatus(422);
    }

    /** @test */
    public function inactive_user_cannot_login(): void
    {
        User::factory()->create([
            'email'    => 'inactive@school.edu',
            'password' => bcrypt('password123'),
            'status'   => 'inactive',
        ]);

        $this->postJson('/api/auth/login', [
            'email'    => 'inactive@school.edu',
            'password' => 'password123',
        ])->assertStatus(422);
    }

    /** @test */
    public function authenticated_user_can_fetch_profile(): void
    {
        $user = User::factory()->create(['role' => 'admin']);

        $this->actingAs($user, 'sanctum')
             ->getJson('/api/auth/profile')
             ->assertOk()
             ->assertJsonFragment(['email' => $user->email]);
    }

    /** @test */
    public function unauthenticated_request_returns_401(): void
    {
        $this->getJson('/api/auth/profile')->assertUnauthorized();
    }

    /** @test */
    public function user_can_logout(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
             ->postJson('/api/auth/logout')
             ->assertOk()
             ->assertJsonFragment(['message' => 'Successfully logged out.']);
    }
}
