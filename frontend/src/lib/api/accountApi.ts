import requests from './agent';
import type { User, UserFormValues } from '../types/user';

const AccountApi = {
  login: async (creds: UserFormValues) => {
    return await requests.post<User>('/auth/login/?useCookies=true', creds);
  },
  register: async (creds: UserFormValues) => {
    return await requests.post<void>('/users/register', creds);
  },
  current: async () => {
    return await requests.get<User>('/auth/currentuser');
  },
  logout: async () => {
    return await requests.post<void>('/auth/logout', {});
  },
  
};

export default AccountApi; 