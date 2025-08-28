# Missing Components and Logic

This file lists components, hooks, and logic that are needed to complete the migration from `/src` to `/source`.

## Components

1. **LoadingState Hook**:
   - File: `source/shared/hooks/useLoadingState.ts`
   - Used in: `source/presentation/app/(auth)/auth.tsx`
   - Functionality: Manages loading states

2. **Supabase Client**:
   - File: `source/service/shared/lib/supabase.ts`
   - Used in: `source/presentation/app/(auth)/auth.tsx` (commented out)
   - Functionality: Provides access to Supabase client

## Business Logic

1. **ServiceFactory**:
   - File: `source/business/chat/services/core/ServiceFactory.ts`
   - Used in: `source/presentation/app/chat/index.tsx` (replaced with UseCaseFactory)
   - Functionality: Creates services for chat functionality

2. **CreateRoomUseCase**:
   - File: `source/business/chat/use-cases/CreateRoomUseCase.ts`
   - Used in: `source/presentation/app/chat/index.tsx`
   - Functionality: Creates a new chat room

## Implementation Plan

1. **For useLoadingState**:
   - Create a simple hook that manages loading state
   - Implement in `source/shared/hooks/useLoadingState.ts`

2. **For Supabase Client**:
   - Create a service that provides access to Supabase
   - Implement in `source/service/shared/lib/supabase.ts`
   - Make sure it follows the layered architecture principles

3. **For CreateRoomUseCase**:
   - Ensure the use case is properly implemented in the business layer
   - Make sure it's registered in the UseCaseFactory

## Testing

After implementing these components, test the following functionality:
1. Authentication flow (sign in, sign up, forgot password)
2. Chat room creation
3. Navigation between screens

## Notes

- The migration is mostly complete, with most files updated to use the correct import paths
- Some functionality has been commented out or replaced with alternatives
- The remaining components should be implemented following the layered architecture principles
