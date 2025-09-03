export interface User {
    id: string;
    userName: string;
    displayName: string;
    email?: string;
    token?: string;
  }
  
  export interface UserFormValues {
    username: string;
    email?: string;
    password: string;
    displayName?: string;
    userName?: string;
  } 