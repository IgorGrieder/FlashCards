export type LoginFormInputs = {
  identifier: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  user: {
    id: string;
    email: string;
  };
};
