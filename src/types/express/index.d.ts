// src/types/express/index.d.ts
import { Role } from '../../common/enums/roles.enum';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      uuid: string;
      role: Role;
    };
  }
}
