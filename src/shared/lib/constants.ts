// src/lib/constants.ts
// This file contains constants that can be used throughout the application

// Supabase configuration
export const SUPABASE = {
  URL: 'https://twzumsgzuwguketxbdet.supabase.co',
  ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3enVtc2d6dXdndWtldHhiZGV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxMDQ2NjIsImV4cCI6MjA2NzY4MDY2Mn0.FcarjbXuL58nFThYd2JNfjHYRCNGqZjtUY-MY1Fj8uQ',
};

// OpenAI configuration
export const OPENAI = {
  MODEL: 'gpt-3.5-turbo',
  TEMPERATURE: 0.7,
  MAX_TOKENS: 1000,
};

// App configuration
export const APP = {
  NAME: 'ChatGPT Clone',
  VERSION: '1.0.0',
};

// NOTE: In a production environment, sensitive values like API keys should be stored
// in environment variables and accessed securely. This file is for development only.
// For production, implement proper environment variable handling or use a secure
// secrets management solution.
