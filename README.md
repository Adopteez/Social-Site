# Adopteez Social Site

A comprehensive social platform for adoptees and their families, connecting people worldwide through groups, messaging, events, and shared experiences.

## Features

### Implemented

- **Authentication System**
  - Email/password authentication with Supabase
  - Login, signup, and password reset
  - Protected routes and session management

- **User Profiles**
  - Profile creation and editing
  - Bio, relation to adoption, language preferences
  - Avatar display

- **News Feed**
  - Create and share posts
  - Like and comment on posts
  - Real-time feed updates

- **Groups**
  - View joined groups
  - National, worldwide, parent, and adoptee groups
  - Group-specific content

- **Messaging**
  - Direct one-on-one conversations
  - Real-time messaging
  - Conversation history

- **Events**
  - View upcoming events
  - Register for events
  - Event details with location, date, price
  - Paid event support

- **Multi-language Support**
  - Danish, Swedish, Norwegian, German, English, French, Spanish
  - i18next integration with language detection

- **Database**
  - Complete schema with Row Level Security
  - Tables for profiles, children, groups, posts, messages, events, forums
  - Privacy settings for child information

### Pending Features

The following features are planned but not yet implemented:

- **Add Child Feature** - Full form with all fields and privacy controls
- **Children Map** - Interactive map showing children's locations with pins
- **Forum System** - Group discussions with threads and replies
- **Search Functionality** - Search users, groups, posts, and events
- **Notifications** - In-app and push notifications
- **Payment Integration** - Stripe integration for paid events

## Tech Stack

- **Frontend**: React, React Router, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Authentication**: Supabase Auth
- **Internationalization**: i18next
- **Maps**: Mapbox GL (ready to integrate)
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Environment variables are already configured in `.env`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

3. Start development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Database Schema

The application uses the following main tables:

- `profiles` - User profiles and preferences
- `children` - Child information with privacy settings
- `child_privacy_settings` - Granular privacy controls
- `groups` - National, worldwide, and themed groups
- `group_members` - Group membership and roles
- `posts` - Social feed posts
- `post_likes` - Post likes
- `post_comments` - Post comments
- `forum_threads` - Forum discussions
- `forum_replies` - Forum replies
- `conversations` - Chat conversations
- `messages` - Chat messages
- `events` - Group events
- `event_attendees` - Event registrations
- `friendships` - Friend connections
- `notifications` - User notifications

## Project Structure

```
src/
├── components/       # Reusable components
│   └── Layout.jsx   # Main layout with navigation
├── contexts/        # React contexts
│   └── AuthContext.jsx
├── i18n/           # Internationalization
│   ├── config.js
│   └── locales/    # Translation files
├── lib/            # Utilities
│   └── supabase.js
├── pages/          # Page components
│   ├── Login.jsx
│   ├── Signup.jsx
│   ├── ResetPassword.jsx
│   ├── Home.jsx
│   ├── Profile.jsx
│   ├── Groups.jsx
│   ├── Messages.jsx
│   └── Events.jsx
└── App.jsx         # Main app component
```

## Design Principles

- **Family-friendly**: Clean, welcoming design suitable for all ages
- **Responsive**: Mobile-first design that works on all devices
- **Accessible**: High contrast, readable fonts, clear navigation
- **Secure**: Row Level Security on all tables, privacy controls
- **Scalable**: Built to handle 10,000+ users

## License

Proprietary - Adopteez

 
