# DriveAssist API Backend

A Laravel 12 REST API backend for the DriveAssist mobile application - a vehicle diagnostics and expert marketplace platform for Ghana.

## Features

- **Authentication**: Sanctum-based API authentication with OTP verification
- **Role-Based Access**: Driver, Expert, and Admin roles with dedicated middleware
- **AI-Powered Diagnostics**: Integrates with Groq, OpenAI, and Anthropic for vehicle issue analysis
- **Expert Marketplace**: Connect drivers with verified mechanics
- **Lead Management**: Track and manage customer leads for experts
- **Road Safety**: Road signs library and driving quizzes
- **Maintenance Tracking**: Vehicle maintenance reminders and logs
- **File Storage**: Local storage with S3 compatibility for production
- **Real-time Chat**: WebSocket-powered messaging between drivers and experts
- **Live Notifications**: Real-time notifications via Laravel Reverb

## Requirements

- PHP 8.2+
- Composer 2.x
- MySQL 8.0+
- Node.js 18+ (for assets)

## Installation

### 1. Clone and Install Dependencies

```bash
cd backend
composer install
```

### 2. Environment Setup

```bash
cp .env.example .env
php artisan key:generate
```

### 3. Configure Database

Edit `.env` with your MySQL credentials:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=drive_assist
DB_USERNAME=root
DB_PASSWORD=your_password
```

### 4. Run Migrations and Seeders

```bash
php artisan migrate
php artisan db:seed
```

### 5. Create Storage Link

```bash
php artisan storage:link
```

### 6. Start the Server

```bash
php artisan serve
```

The API will be available at `http://localhost:8000`

## API Documentation

Swagger documentation is available at:
```
http://localhost:8000/api/documentation
```

To regenerate documentation:
```bash
php artisan l5-swagger:generate
```

## Configuration

### AI Service

Configure your preferred AI provider in `.env`:

```env
# Default provider (groq, openai, or anthropic)
AI_DEFAULT_PROVIDER=groq

# Groq (Free tier available)
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile

# OpenAI (Alternative)
OPENAI_API_KEY=your_openai_key
OPENAI_MODEL=gpt-4o-mini

# Anthropic (Alternative)
ANTHROPIC_API_KEY=your_anthropic_key
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
```

### File Storage

For local development:
```env
FILESYSTEM_DISK=local
MEDIA_DISK_DRIVER=local
```

For production (AWS S3):
```env
FILESYSTEM_DISK=s3
MEDIA_DISK_DRIVER=s3
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=your_bucket
```

### Email

Development uses log driver (emails logged to `storage/logs/mail.log`):
```env
MAIL_MAILER=log
MAIL_LOG_CHANNEL=mail
```

For production, configure SMTP or other mailer.

### Business Model

```env
FREE_LEADS_FOR_EXPERTS=4      # Free leads after KYC approval
FREE_DIAGNOSES_FOR_GUESTS=3   # Free diagnoses for guests
FREE_DIAGNOSES_FOR_DRIVERS=5  # Free diagnoses for registered drivers
```

### Real-time (Laravel Reverb)

Configure WebSocket server in `.env`:

```env
BROADCAST_CONNECTION=reverb

# Reverb Server Configuration
REVERB_APP_ID=driveassist
REVERB_APP_KEY=your-reverb-key
REVERB_APP_SECRET=your-reverb-secret
REVERB_HOST=localhost
REVERB_PORT=8080
REVERB_SCHEME=http

# Server binding
REVERB_SERVER_HOST=0.0.0.0
REVERB_SERVER_PORT=8080
```

For production with SSL:
```env
REVERB_SCHEME=https
REVERB_PORT=443
```

## Queue Workers

For background job processing:

```bash
php artisan queue:work
```

For production, use Supervisor to manage queue workers.

## WebSocket Server (Reverb)

Start the Reverb WebSocket server:

```bash
php artisan reverb:start
```

For production with verbose logging:
```bash
php artisan reverb:start --debug
```

The WebSocket server will be available at `ws://localhost:8080`

## API Endpoints Overview

### Public Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | User login |
| POST | `/api/v1/auth/forgot-password` | Request password reset |
| GET | `/api/v1/regions` | List Ghana regions |
| GET | `/api/v1/vehicle-makes` | List vehicle manufacturers |
| GET | `/api/v1/road-signs` | List road signs |
| GET | `/api/v1/articles` | List articles |
| GET | `/api/v1/quiz/categories` | Quiz categories |

### Authenticated Endpoints (Driver)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/vehicles` | List user vehicles |
| POST | `/api/v1/vehicles` | Add vehicle |
| POST | `/api/v1/diagnoses` | Submit diagnosis |
| GET | `/api/v1/diagnoses/{id}/experts` | Get matching experts |
| GET | `/api/v1/maintenance/reminders` | Maintenance reminders |
| POST | `/api/v1/reviews` | Submit expert review |

### Expert Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/expert/profile` | Get expert profile |
| PUT | `/api/v1/expert/profile` | Update profile |
| GET | `/api/v1/leads` | List leads |
| PUT | `/api/v1/leads/{id}/contact` | Mark lead contacted |
| GET | `/api/v1/kyc/status` | KYC verification status |
| POST | `/api/v1/kyc/documents` | Upload KYC document |

### Guest Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/diagnoses/guest` | Guest diagnosis (limited) |

### Messaging Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/messages/conversations` | List conversations |
| POST | `/api/v1/messages/conversations` | Get/create conversation |
| GET | `/api/v1/messages/conversations/{id}` | Get messages |
| POST | `/api/v1/messages/conversations/{id}` | Send message |
| POST | `/api/v1/messages/conversations/{id}/read` | Mark as read |
| POST | `/api/v1/messages/conversations/{id}/typing` | Typing indicator |
| GET | `/api/v1/messages/unread-count` | Total unread count |

### Broadcasting Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/broadcasting/auth` | WebSocket auth (Sanctum) |

## Project Structure

```
app/
├── Events/                    # Broadcast events
│   ├── NewMessageEvent.php    # New chat message
│   ├── MessageReadEvent.php   # Message read receipts
│   ├── UserTypingEvent.php    # Typing indicators
│   ├── NewLeadEvent.php       # New lead notification
│   ├── DiagnosisUpdatedEvent.php
│   └── UserNotificationEvent.php
├── Http/
│   ├── Controllers/Api/V1/    # API Controllers
│   ├── Middleware/            # Custom middleware
│   ├── Requests/              # Form request validation
│   └── Resources/             # API resources
├── Jobs/                      # Queue jobs
├── Mail/                      # Mailable classes
├── Models/                    # Eloquent models
├── Notifications/             # Notification classes
└── Services/                  # Business logic services
    ├── AIService.php          # AI integration
    └── FileUploadService.php  # File handling

database/
├── migrations/                # Database migrations
└── seeders/                   # Database seeders

routes/
├── api.php                    # API routes
├── channels.php               # Broadcast channel authorization
└── console.php                # Artisan commands
```

## Testing

```bash
php artisan test
```

## Test Accounts

After seeding, these test accounts are available:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@driveassist.com | password |
| Driver | driver@driveassist.com | password |
| Expert | expert@driveassist.com | password |

## Middleware

| Middleware | Description |
|------------|-------------|
| `auth:sanctum` | API authentication |
| `driver` | Driver role required |
| `expert` | Expert role required |
| `admin` | Admin role required |
| `onboarding.completed` | Onboarding must be done |
| `kyc.completed` | KYC must be approved |
| `track.guest` | Track guest device |

## Seeded Data

The seeders populate:
- 16 Ghana regions
- 30 vehicle manufacturers with models
- 20 mechanic specializations
- 17 maintenance types
- 32 road signs in 4 categories
- 30 quiz questions in 5 categories
- 8 articles in 5 categories
- Diagnosis, lead, and subscription packages

## Production Deployment

1. Set `APP_ENV=production` and `APP_DEBUG=false`
2. Configure production database
3. Set up Redis for caching/queues (recommended)
4. Configure S3 for file storage
5. Set up proper mail service
6. Run `php artisan config:cache`
7. Run `php artisan route:cache`
8. Set up Supervisor for queue workers
9. Set up Supervisor for Reverb WebSocket server
10. Configure SSL/HTTPS (also for WebSocket via wss://)

### Supervisor Configuration for Reverb

```ini
[program:reverb]
command=php /path/to/artisan reverb:start
autostart=true
autorestart=true
user=www-data
redirect_stderr=true
stdout_logfile=/var/log/reverb.log
```

## React Native Integration

For React Native Expo apps, use `pusher-js` to connect to Reverb:

```javascript
import Pusher from 'pusher-js/react-native';

const pusher = new Pusher('your-reverb-key', {
  wsHost: 'your-domain.com',
  wsPort: 8080,
  wssPort: 443,
  forceTLS: true,
  disableStats: true,
  enabledTransports: ['ws', 'wss'],
  authEndpoint: 'https://your-api.com/api/v1/broadcasting/auth',
  auth: {
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  },
});

// Subscribe to private channel
const channel = pusher.subscribe('private-user.123');
channel.bind('notification', (data) => {
  console.log('Notification received:', data);
});

// Subscribe to conversation
const chatChannel = pusher.subscribe('private-conversation.1');
chatChannel.bind('message.new', (data) => {
  console.log('New message:', data);
});
```

## License

Proprietary - DriveAssist
