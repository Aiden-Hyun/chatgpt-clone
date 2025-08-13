// src/shared/lib/supabase/requireSession.ts
import { Session } from '@supabase/supabase-js';
import { getSession } from './getSession';

export class UnauthenticatedError extends Error {
  constructor(message: string = 'User is not authenticated') {
    super(message);
    this.name = 'UnauthenticatedError';
  }
}

export type OnUnauthenticated = () => void | Promise<void>;

/**
 * Returns a Session if present; otherwise triggers the onUnauthenticated handler and throws.
 * The unauthenticated path is effectively `never` for callers.
 */
export async function requireSession(onUnauthenticated?: OnUnauthenticated): Promise<Session> {
  const session = await getSession();
  if (!session) {
    if (onUnauthenticated) {
      await onUnauthenticated();
    }
    throw new UnauthenticatedError();
  }
  return session;
}


