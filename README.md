# 📚 Online School Diary System

A production-ready, full-stack **Online School Diary System** enabling real-time communication between teachers, students, parents, and administrators.

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite, Tailwind CSS, React Router v6, Axios |
| State | Context API + React Hooks |
| Backend | Laravel 11, PHP 8.2 |
| Auth | Laravel Sanctum (token-based) |
| Database | MySQL 8+ |
| Queue / Cache | Redis (database fallback) |
| Testing | PHPUnit (Laravel), Vite + React |

---

## 👥 User Roles

| Role | Capabilities |
|---|---|
| **Admin** | Manage all users, classes, subjects; view activity logs |
| **Teacher** | Create/edit/delete homework, announcements, remarks |
| **Student** | View homework, announcements, personal remarks |
| **Parent** | Monitor child's homework, announcements, teacher remarks |

---

## 📁 Project Structure

```
School-Diary/
├── frontend/                    # React application
│   ├── src/
│   │   ├── context/             # AuthContext (global auth state)
│   │   ├── services/            # Axios service layer + mock API
│   │   ├── data/                # Mock data for demo mode
│   │   ├── components/
│   │   │   ├── layout/          # Layout, Sidebar, Navbar
│   │   │   ├── common/          # Modal, Badge, StatsCard, Pagination…
│   │   │   └── diary/           # DiaryCard, DiaryForm
│   │   └── pages/
│   │       ├── Login.jsx
│   │       ├── admin/           # Dashboard, ManageUsers, ManageClasses, ActivityLogs
│   │       ├── teacher/         # Dashboard, DiaryManagement
│   │       ├── student/         # Dashboard
│   │       └── parent/          # Dashboard
│   └── .env                     # VITE_DEMO_MODE=true
│
└── backend/                     # Laravel application
    ├── app/
    │   ├── Http/
    │   │   ├── Controllers/     # Auth, Diary, User, Class
    │   │   ├── Middleware/      # RoleMiddleware
    │   │   └── Requests/        # DiaryEntryRequest (validation)
    │   ├── Models/              # User, DiaryEntry, Student, Teacher, ParentProfile…
    │   ├── Services/            # DiaryService, UserService, ActivityLogService, LoadBalancerService
    │   ├── Jobs/                # ProcessDiaryEntry (queued)
    │   ├── Events/              # DiaryEntryCreated
    │   ├── Listeners/           # NotifyStudentsAndParents (queued)
    │   ├── Notifications/       # NewDiaryEntryNotification
    │   ├── Policies/            # DiaryEntryPolicy
    │   └── Providers/           # AppServiceProvider, EventServiceProvider
    ├── database/
    │   ├── migrations/          # 9 migration files
    │   └── seeders/             # DatabaseSeeder, UserSeeder, ClassSubjectSeeder, DiaryEntrySeeder
    ├── routes/api.php
    └── tests/
        ├── Feature/             # AuthTest, DiaryTest
        └── Unit/                # DiaryServiceTest
```

---

## 🚀 Quick Start

### Frontend (Demo Mode — no backend required)

```bash
cd frontend
npm install
npm run dev
# Open http://localhost:3000
```

**Demo login credentials:**

| Role | Email | Password |
|---|---|---|
| Admin | admin@school.edu | admin123 |
| Teacher | j.anderson@school.edu | teacher123 |
| Student | e.brown@school.edu | student123 |
| Parent | r.brown@parent.com | parent123 |

> Use the **Quick Login** buttons on the login screen for one-click access.

---

### Backend Setup (Laravel)

#### Prerequisites
- PHP 8.2+
- Composer
- MySQL 8+
- Redis (or set `QUEUE_CONNECTION=database`)

#### Installation

```bash
cd backend

# 1. Install dependencies
composer install

# 2. Create environment file
cp .env.example .env

# 3. Generate application key
php artisan key:generate

# 4. Configure database in .env
#    DB_DATABASE=school_diary
#    DB_USERNAME=root
#    DB_PASSWORD=your_password

# 5. Run migrations and seed data
php artisan migrate --seed

# 6. Start the API server
php artisan serve --port=8000

# 7. Start queue worker (separate terminal)
php artisan queue:work --queue=diary,notifications --tries=3
```

#### Connect frontend to backend

Edit `frontend/.env`:
```env
VITE_DEMO_MODE=false
VITE_API_URL=http://localhost:8000/api
```

---

## 🔌 API Reference

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Login → returns Bearer token |
| GET | `/api/auth/profile` | Get authenticated user |
| POST | `/api/auth/logout` | Revoke token |
| POST | `/api/auth/change-password` | Update password |

### Diary Entries

| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/api/diary` | All | List entries (role-filtered) |
| POST | `/api/diary` | Teacher, Admin | Create entry |
| GET | `/api/diary/{id}` | All | Get single entry |
| PUT | `/api/diary/{id}` | Teacher (owner), Admin | Update entry |
| DELETE | `/api/diary/{id}` | Teacher (owner), Admin | Delete entry |

**Query parameters for GET `/api/diary`:**
- `type` — `homework` \| `announcement` \| `remark`
- `class_id` — filter by class
- `subject_id` — filter by subject
- `date_from` / `date_to` — date range
- `search` — full-text search (title + description)
- `per_page` — pagination size (default: 10)

### Users (Admin only)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users` | List all users (paginated) |
| POST | `/api/users` | Create user |
| PUT | `/api/users/{id}` | Update user |
| DELETE | `/api/users/{id}` | Soft-delete user |
| GET | `/api/users/students` | Students list (for dropdowns) |
| GET | `/api/users/teachers` | Teachers list |
| POST | `/api/users/parents/{id}/students` | Assign child to parent |
| DELETE | `/api/users/parents/{pid}/students/{sid}` | Remove child from parent |
| GET | `/api/users/activity-logs` | Activity log (paginated) |

### Classes & Subjects

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/classes` | List all classes |
| POST | `/api/classes` | Create class (admin) |
| PUT | `/api/classes/{id}` | Update class (admin) |
| DELETE | `/api/classes/{id}` | Delete class (admin) |
| GET | `/api/classes/{id}/students` | Students in class |
| GET | `/api/subjects` | List all subjects |
| POST | `/api/subjects` | Create subject (admin) |

---

## ⚡ Concurrency & Scalability

### Thread-safe Diary Submissions
- **Atomic Cache Lock** per teacher (`Cache::lock`) prevents duplicate concurrent submissions
- **DB Transactions** wrap every write operation
- **Optimistic Locking** (`version` field) detects conflicting concurrent edits and returns HTTP 409

### Queue-based Processing
- `ProcessDiaryEntry` job runs on the `diary` queue
- `NotifyStudentsAndParents` listener runs on the `notifications` queue
- Both implement `ShouldQueue` — zero blocking of HTTP responses

### Load Balancing
`LoadBalancerService` demonstrates round-robin server selection using Redis-backed atomic counters:

```
[Client] → [Nginx / HAProxy] → [Laravel #1 | #2 | #3] → [MySQL + Redis]
```

The `lb_round_robin_index` key in Redis is atomically incremented so all app instances share state without race conditions.

### Database Indexing
All high-traffic columns are indexed:
- `diary_entries.type`, `teacher_id`, `class_id`, `student_id`, `created_at`
- `users.role`, `email`
- Composite: `(type, class_id)`, `(teacher_id, type)`

---

## 🔒 Security

- **Sanctum token** auth — tokens expire after 7 days
- **Role middleware** enforces RBAC on every protected route
- **Form Request validation** sanitizes all inputs before they touch the DB
- **Policy classes** enforce ownership rules (teachers can only edit their own entries)
- **Soft deletes** preserve audit trails
- **Rate limiting** — 120 req/min globally, 10 req/min on `/api/auth/login`

---

## 🧪 Running Tests

```bash
cd backend

# Run all tests
php artisan test

# Run specific suite
php artisan test --filter=AuthTest
php artisan test --filter=DiaryTest
php artisan test --filter=DiaryServiceTest

# With coverage
php artisan test --coverage
```

---

## 🌐 Production Deployment

### Frontend
```bash
cd frontend
npm run build
# Deploy /dist to Nginx / Netlify / Vercel
```

### Backend (Nginx + PHP-FPM)
```nginx
server {
    listen 80;
    root /var/www/backend/public;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

```bash
# Production optimisation
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize

# Queue workers via Supervisor
php artisan queue:work redis --queue=diary,notifications --sleep=3 --tries=3 --max-time=3600
```

---

## 📊 Database Schema

```
users ──────────────────────────────────────── role: admin|teacher|student|parent
  ├─ teachers (user_id FK)
  │    └─ class_teacher (teacher_id, class_id, subject_id)
  ├─ students (user_id FK, class_id FK)
  │    └─ parent_student (student_id, parent_id)
  ├─ parents  (user_id FK)
  └─ diary_entries (teacher_id FK, class_id FK, subject_id FK, student_id FK)

classes  ←──── diary_entries.class_id
subjects ←──── diary_entries.subject_id
activity_logs (user_id FK)
notifications (notifiable polymorphic)
```
