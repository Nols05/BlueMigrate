# BlueMigrate

A powerful migration tool that helps you seamlessly transfer your Twitter/X content to Bluesky while preserving original timestamps, media, and thread structures.

<img width="1919" height="991" alt="image" src="https://github.com/user-attachments/assets/798b2e66-4416-4111-ac65-e157066e4e8f" />



## Overview

BlueMigrate is a full-stack web application that enables users to migrate their Twitter/X tweets and threads to Bluesky. The platform maintains the original posting dates, handles media attachments, preserves thread structures, and provides a user-friendly interface for managing migrations.

## Features

- **Tweet Migration**: Migrate individual tweets or entire user timelines to Bluesky
- **Thread Support**: Extract and migrate complete Twitter threads while maintaining reply structure
- **Original Timestamps**: Posts are backdated to their original Twitter posting dates
- **Media Handling**: Automatically processes and uploads images from tweets
- **Rate Limiting**: Intelligent rate limiting to prevent API throttling and account issues
- **User Authentication**: Secure user accounts with session management
- **Migration Tracking**: Real-time status updates for all migration jobs
- **Premium Features**: Extended migration limits for premium users
- **Featured Accounts**: Subscription-based featured account listings

## Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Prisma** - Database ORM
- **Stripe** - Payment processing
- **Atproto API** - Bluesky integration

### Backend
- **FastAPI** - High-performance Python web framework
- **Twikit** - Twitter/X API client
- **Atproto** - Bluesky protocol implementation
- **Uvicorn** - ASGI server
- **PostgreSQL** - Database (via Prisma)

## Project Structure

```
bluemigrateShowcase/
├── frontend-next/          # Next.js frontend application
│   ├── src/
│   │   ├── actions/       # Server actions
│   │   ├── app/           # Next.js app router pages
│   │   ├── components/    # React components
│   │   └── lib/           # Utility libraries
│   ├── prisma/            # Database schema
│   └── public/             # Static assets
│
└── backend-python/         # FastAPI backend service
    ├── app.py             # Main FastAPI application
    ├── bluesky.py         # Bluesky migration logic
    ├── twitter.py         # Twitter API integration
    ├── processMigrations.py  # Queue processing
    └── rateLimiter.py     # Rate limiting implementation
```

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 20.x or higher
- **Python** 3.10 or higher
- **PostgreSQL** 12.x or higher
- **Git**

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/bluemigrateShowcase.git
cd bluemigrateShowcase
```

### 2. Backend Setup

```bash
cd backend-python

# Create a virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Frontend Setup

```bash
cd frontend-next

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate
```

### 4. Database Setup

```bash
cd frontend-next

# Create .env file with your database URL
echo "DATABASE_URL=postgresql://user:password@localhost:5432/bluemigrate" > .env

# Run database migrations
npx prisma db push
```

## Configuration

### Backend Environment Variables

Create a `.env` file in the `backend-python` directory:

```env
# API Configuration
API_FRONTEND_URL=http://localhost:3000

# Twitter API (requires cookies.json - see below)
# The cookies.json file should be placed in backend-python/
# This file contains Twitter authentication cookies
```

**Important**: The `cookies.json` file contains sensitive authentication data and should never be committed to version control. See the `.gitignore` file for excluded files.

### Frontend Environment Variables

Create a `.env.local` file in the `frontend-next` directory:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/bluemigrate

# Next.js
NEXT_PUBLIC_URL=http://localhost:3000
NODE_ENV=development

# API Configuration
API_URL=http://localhost:8001

# Stripe (for payments)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_POSTS_PRICE_ID=price_...
STRIPE_FEATURED_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Bluesky API
BLUESKY_HANDLE=your-handle.bsky.social
BLUESKY_PASSWORD=your-app-password

# Session Security
SECRET_JWS=your-secret-key-here-min-32-chars

# Email Notifications
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
NOTIFICATION_EMAIL=notifications@example.com
```

## Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend-python
uvicorn app:app --reload --port 8001
```

**Terminal 2 - Frontend:**
```bash
cd frontend-next
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8001

### Production Mode

Both frontend and backend include Dockerfiles for containerized deployment:

```bash
# Build backend
cd backend-python
docker build -t bluemigrate-backend .

# Build frontend
cd frontend-next
docker build -t bluemigrate-frontend .
```

## Usage


1. **Create an Account**: Sign up with your email address
2. **Choose Migration Type**: Select between migrating posts or threads
3. **Provide Credentials**: Enter your Bluesky handle and app password
4. **Start Migration**: Submit your Twitter username or thread URLs
5. **Track Progress**: Monitor migration status in real-time
6. **View Results**: Check your Bluesky account for migrated content

### App Password Setup

For security, Bluesky requires an app password for third-party applications:

1. Go to Bluesky Settings → App Passwords
2. Create a new app password with a descriptive name
3. Copy the generated password
4. Use this password (not your main password) when migrating


## Limitations

- Twitter API limits retrieval to the last 3,200 tweets (including RTs and quotes)
- Tweets longer than 297 characters are truncated (Bluesky limit)
- Videos are migrated as thumbnails only
- Retweets and quote tweets are not migrated
- NSFW or private accounts cannot be migrated

