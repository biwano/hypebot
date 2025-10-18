# HypeBot

A bot manager that receives signals from TradingView to make trades on Hyperliquid.

## Features

- **Bot Management**: Create, delete, and manage trading bots
- **Signal Processing**: Receive and process TradingView signals
- **Exchange Integration**: Trade on Hyperliquid exchange
- **Authentication**: Secure user authentication with Supabase
- **Real-time Updates**: Monitor bot status and positions

## Tech Stack

- **Frontend**: Nuxt 4, Vue 3, Vuetify
- **Backend**: Nuxt Server API
- **Database**: Supabase (PostgreSQL)
- **Exchange**: Hyperliquid (via ccxt)
- **Authentication**: Supabase Auth

## Setup

### 1. Environment Variables

Copy the example environment file and configure your credentials:

```bash
cp env.example .env
```

Fill in the following variables in your `.env` file:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Hyperliquid Exchange Configuration
HYPERLIQUID_API_KEY=your_hyperliquid_api_key
HYPERLIQUID_SECRET_KEY=your_hyperliquid_secret_key

# App Configuration
NODE_ENV=development
```

### 2. Database Setup

Run the database migration to create the required tables:

```sql
-- Run the migration in your Supabase SQL editor
-- File: supabase/migrations/001_create_bots_table.sql
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Usage

### Creating a Bot

1. Sign up or sign in to your account
2. Click "Create Bot" on the bots page
3. Enter a name and trading pair (e.g., "BTC-USD")
4. The bot will be created with a default desired_direction of 0 (exit)

### Receiving Signals

Send a POST request to `/api/bots/{bot_id}/signal` with the following body:

```json
{
  "desired_direction": 1
}
```

Where:
- `1` = Long 5X
- `-1` = Short 5X  
- `0` = Exit position
- Any other number = Proportional leverage

### Bot Execution

Bots are executed:
- When a signal is received
- Periodically via the cron endpoint `/api/cron/execute-bots`

## API Endpoints

### Bots
- `GET /api/bots` - List all bots for the authenticated user
- `POST /api/bots` - Create a new bot
- `GET /api/bots/{id}` - Get a specific bot
- `PUT /api/bots/{id}` - Update a bot
- `DELETE /api/bots/{id}` - Delete a bot
- `POST /api/bots/{id}/exit` - Exit a bot's position
- `POST /api/bots/{id}/signal` - Send a signal to a bot

### Cron
- `POST /api/cron/execute-bots` - Execute all bots (for scheduled tasks)

## Security

- All API endpoints require authentication
- Row Level Security (RLS) is enabled on the bots table
- Users can only access their own bots
- API keys are stored securely in environment variables

## Development

### Project Structure

```
├── app.vue                 # Main app layout
├── pages/                  # Vue pages
│   ├── index.vue          # Home page
│   ├── login.vue          # Login page
│   ├── register.vue       # Registration page
│   └── bots/              # Bot management pages
├── components/            # Vue components
├── server/                # Server-side code
│   ├── api/              # API endpoints
│   └── services/         # Business logic
├── types/                # TypeScript type definitions
└── supabase/             # Database migrations
```

### Adding New Features

1. Create API endpoints in `server/api/`
2. Add business logic in `server/services/`
3. Create Vue components in `components/`
4. Add pages in `pages/`
5. Update types in `types/index.ts`

## Deployment

1. Set up your production environment variables
2. Run database migrations
3. Deploy to your preferred hosting platform
4. Set up a cron job to call `/api/cron/execute-bots` periodically

## License

MIT