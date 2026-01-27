export type JWTPayload = {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
};

export type JWTUser = Omit<JWTPayload, 'iat' | 'exp'>;
