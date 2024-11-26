export type LoginResponse = {
  logged: boolean;
  message?: string;
  username?: string;
};

export type CreateAccountResponse = {
  accountCreated: boolean;
  message: string;
  username?: string;
};

export type UserCtx = {
  user: string | null;
  login: (data: string) => void;
  logout: VoidFunction;
};
