# ChatGPT Clone

A feature-rich chat application built with React Native, Expo, and Supabase that mimics the functionality of ChatGPT.

## Features

- 💬 Real-time chat interface with AI responses
- 🔄 Message regeneration capability
- 📱 Cross-platform support (iOS, Android, Web)
- 🔒 Secure authentication with Google OAuth
- 📋 Multiple chat rooms management
- 🤖 Support for multiple AI models (GPT-3.5, GPT-4, etc.)
- 🎨 Beautiful and responsive UI

## Tech Stack

- **Frontend**: React Native, Expo Router
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with Google OAuth
- **State Management**: React Hooks
- **Styling**: React Native StyleSheet

## Project Structure

The project follows a feature-based architecture:

```
src/
├── features/
│   ├── auth/       # Authentication related code
│   └── chat/       # Chat functionality
│       ├── components/
│       ├── hooks/
│       ├── services/
│       └── types/
└── shared/
    ├── components/ # Shared UI components
    ├── hooks/      # Shared hooks
    └── lib/        # Shared utilities
```

## Database Schema

The application uses Supabase with the following tables:
- `chatrooms`: Stores chat rooms with fields for id, user_id, name, and model
- `messages`: Stores chat messages with fields for id, room_id, user_id, role, and content
- `profiles`: Stores user profile information

## Getting Started

1. Clone the repository

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up Supabase
   - Create a Supabase project
   - Run the migrations in `supabase/migrations`
   - Configure your environment variables

4. Start the development server
   ```bash
   npx expo start
   ```

## Environment Setup

Create a `.env` file in the root directory with the following variables:

```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
