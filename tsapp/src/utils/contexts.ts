import React from 'react';

//userId context
export interface IUserContext {
  setLoggedIn: React.Dispatch<React.SetStateAction<boolean>>|undefined;
  uid: string|undefined;
  name: string|undefined;
  loggedInFromTa: boolean;
  setLoggedInFromTa: React.Dispatch<React.SetStateAction<boolean>>|undefined;
};

export const UserContext = React.createContext<IUserContext>({
  setLoggedIn: undefined,
  uid: undefined,
  name: undefined,
  loggedInFromTa: true,
  setLoggedInFromTa: undefined,
});