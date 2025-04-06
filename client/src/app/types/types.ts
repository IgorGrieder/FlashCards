import { Dispatch, SetStateAction } from "react";

export type DeletionResponse = {
  collectionDeleted: number;
  message: string;
};

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
  topic: string;
  question: string;
  answer: string;
  img: string | null;
  _id: string;
};

export type Collection = {
  _id: string;
  name: string;
  owner: string;
  category: string;
  cards: Card[];
};

export type CollectionUpdateResponse = {
  cardUpdated: boolean;
};

export type AddCardToCollectionResponse = {
  cardAdded: boolean;
  message: string;
  newCard: string;
  imageURL: string;
};

export type CreateCollectionResponse = {
  collectionCreated: boolean;
  message: string;
  collection?: Collection;
};

export type ImagesResponse = {
  success: boolean;
  images: ImagesCaching;
};

export type ImagesCaching = {
  [cardId: string]: {
    data: ArrayBuffer;
    contentType: string;
    contentLength: string;
  };
};
