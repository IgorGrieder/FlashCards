import { Dispatch, SetStateAction } from "react";

export type DeletionResponse = {
  collectionDeleted: number,
  message: string
}

export type LoginResponse = {
  logged: boolean;
  message?: string;
  username?: string;
  collections?: Collection[];
};

export type Direction = "left" | "right";

export type FlashCardContextType = {
  answersArray: boolean[];
  setAnswersArray: Dispatch<SetStateAction<boolean[]>>;
  clearAnswers: () => void;
};

export type User = {
  username: string;
  collections: Collection[] | [];
};

export type CreateAccountResponse = {
  accountCreated: boolean;
  message: string;
  username?: string;
};

export type UserCtx = {
  user: User | null;
  dispatch: Dispatch<ActionUser>;
};

export type LogoutAction = {
  type: "LOGOUT";
};

export type LoginAction = {
  type: "LOGIN";
  payload: User;
};

export type UpdateUser = {
  type: "UPDATE";
  payload: Partial<User>;
};

export type ActionUser = LogoutAction | LoginAction | UpdateUser;

export type CollectionsRespose = {
  collectionsFound: boolean;
  collections?: [Collection];
  message?: string;
};

export type Card = {
  category: string;
  question: string;
  answer: string;
  img?: string;
};

export type Collection = {
  _id: string,
  name: string;
  owner: string;
  category: string;
  cards: Card[];
};
