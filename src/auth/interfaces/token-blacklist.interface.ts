// src/auth/interfaces/token-blacklist.interface.ts
export interface ITokenBlacklist {
    blacklistToken(token: string, expirationTime: number): Promise<void>;
    isBlacklisted(token: string): Promise<boolean>;
  }
  