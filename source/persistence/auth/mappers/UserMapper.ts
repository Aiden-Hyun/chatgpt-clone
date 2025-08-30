import { User, SupabaseUser, UserStorage, UserDTO } from '../../interfaces/auth';

export class UserMapper {
  toDomain(supabaseUser: SupabaseUser): User {
    return new User(
      supabaseUser.id,
      supabaseUser.email,
      supabaseUser.user_metadata?.display_name || '',
      supabaseUser.user_metadata?.avatar_url || null,
      supabaseUser.user_metadata?.permissions || ['user'],
      new Date(supabaseUser.created_at),
      new Date(supabaseUser.updated_at)
    );
  }

  toStorage(user: User): UserStorage {
    return {
      id: user.id,
      email: user.email,
      display_name: user.displayName,
      avatar_url: user.avatarUrl,
      permissions: user.permissions,
      created_at: user.createdAt.toISOString(),
      updated_at: user.updatedAt.toISOString()
    };
  }

  toDatabase(user: User): UserStorage {
    return {
      id: user.id,
      email: user.email,
      display_name: user.displayName,
      avatar_url: user.avatarUrl,
      permissions: JSON.stringify(user.permissions),
      created_at: user.createdAt.toISOString(),
      updated_at: user.updatedAt.toISOString()
    };
  }

  fromDatabase(dbUser: UserStorage): User {
    return new User(
      dbUser.id,
      dbUser.email,
      dbUser.display_name,
      dbUser.avatar_url,
      typeof dbUser.permissions === 'string' 
        ? JSON.parse(dbUser.permissions) 
        : dbUser.permissions || ['user'],
      new Date(dbUser.created_at),
      new Date(dbUser.updated_at)
    );
  }

  toDTO(user: User): UserDTO {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      permissions: user.permissions,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    };
  }

  fromDTO(dto: UserDTO): User {
    return new User(
      dto.id,
      dto.email,
      dto.displayName,
      dto.avatarUrl,
      dto.permissions,
      new Date(dto.createdAt),
      new Date(dto.updatedAt)
    );
  }

  updateUser(user: User, updates: Partial<{
    displayName: string;
    avatarUrl: string | null;
    permissions: string[];
  }>): User {
    return new User(
      user.id,
      user.email,
      updates.displayName ?? user.displayName,
      updates.avatarUrl ?? user.avatarUrl,
      updates.permissions ?? user.permissions,
      user.createdAt,
      new Date() // Update the updatedAt timestamp
    );
  }
}
