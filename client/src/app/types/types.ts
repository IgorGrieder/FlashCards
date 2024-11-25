export type LoginFormInputs = {
  identifier: string;
  password: string;
};

export type LoginResponse = {
  logged: boolean;
  message?: string;
  username?: string;
};

export type UserCtx = {
  user: string | null;
  login: (data: string) => void;
  logout: VoidFunction;
};
