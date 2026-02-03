import { EUserRole } from 'src/modules/user/enums/role.enum';

export type JWTPayload = {
  userId: string;
  email: string;
  role: EUserRole;
  iat: number;
  exp: number;
};

export type JWTUser = Omit<JWTPayload, 'iat' | 'exp'>;
