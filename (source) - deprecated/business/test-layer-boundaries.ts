// Test file to demonstrate layer boundary enforcement within business layer
// This file should trigger ESLint errors for layer boundary violations

// ❌ This should trigger an error - business layer importing from presentation

// ❌ This should trigger an error - business layer importing from database

// ✅ This should be allowed - business layer importing from service

// ✅ This should be allowed - business layer importing from persistence

