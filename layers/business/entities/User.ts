// Business entity - Domain model for users
export interface User {
  id: string;
  email: string;
  createdAt: Date;
  lastSignInAt?: Date;
}

export class UserEntity {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly createdAt: Date = new Date(),
    public readonly lastSignInAt?: Date
  ) {}

  static fromJSON(data: any): UserEntity {
    return new UserEntity(
      data.id,
      data.email,
      data.createdAt ? new Date(data.createdAt) : new Date(),
      data.lastSignInAt ? new Date(data.lastSignInAt) : undefined
    );
  }

  toJSON(): User {
    return {
      id: this.id,
      email: this.email,
      createdAt: this.createdAt,
      lastSignInAt: this.lastSignInAt
    };
  }

  withLastSignIn(lastSignInAt: Date): UserEntity {
    return new UserEntity(
      this.id,
      this.email,
      this.createdAt,
      lastSignInAt
    );
  }

  isValidEmail(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email);
  }
}
