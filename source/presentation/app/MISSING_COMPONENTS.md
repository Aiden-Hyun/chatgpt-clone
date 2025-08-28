# Missing Components and Logic

This file lists components, hooks, and logic that are imported from `/src` but don't have direct equivalents in the `/source` directory yet. These need to be implemented before the migration can be completed.

## Chat Features

1. **ServiceFactory** - `ServiceFactory.createChatRoomService()`
   - Used in: `source/presentation/app/chat/index.tsx`
   - Functionality: Creates chat room services
   - Replacement: Should use `UseCaseFactory` from `/source/business/shared/UseCaseFactory.ts`

2. **LoadingWrapper** - `LoadingWrapper` component
   - Used in: `source/presentation/app/chat/index.tsx`
   - Functionality: Shows loading state
   - Replacement: Use `LoadingWrapper` from `/source/presentation/components/LoadingWrapper.tsx`

## UI Components

1. **UI Components** - `@/components/ui`
   - Used in: Multiple files in `source/presentation/app`
   - Functionality: Basic UI components like Button, Card, Text, etc.
   - Replacement: Use components from `/source/presentation/components/ui`

## Layout Utilities

1. **getButtonSize** - `@/shared/utils/layout`
   - Used in: `source/presentation/app/settings/settings.styles.ts` (commented out)
   - Functionality: Gets consistent button sizes
   - Replacement: Use theme system from `/source/presentation/theme`

## Authentication

1. **useUserInfo** - `useUserInfo` hook
   - Used in: `source/presentation/app/settings/index.tsx`
   - Functionality: Gets user information
   - Replacement: Create a hook that uses the session repository or user repository from `/source/business`

## Supabase Integration

1. **supabase** - `@/shared/lib/supabase`
   - Used in: `source/presentation/app/(auth)/auth.tsx`
   - Functionality: Direct Supabase client access
   - Replacement: Should use repositories and use cases from `/source/business` instead of direct Supabase access

## Implementation Plan

To complete the migration, follow these steps:

1. For each missing component/logic:
   - Check if there's an equivalent in `/source` that can be used directly
   - If not, implement the missing functionality following the layered architecture principles
   - Update imports in all affected files

2. Focus on implementing:
   - Business layer use cases for chat room creation
   - UI components for loading and display
   - Authentication hooks that use the business layer

3. Test each implementation to ensure it works correctly with the existing code

4. Once all missing components are implemented, test the entire application to ensure everything works together
