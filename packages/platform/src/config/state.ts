import { createGlobalState } from '@react-devui/hooks';

export interface UserState {
  name: string;
  avatar: string;
  role: 'admin' | 'user';
  permission: (string | number)[];
}
export const useUserState = createGlobalState<UserState>();

export interface NotificationItem {
  id: string;
  title: string;
  list: {
    message: string;
    read: boolean;
  }[];
}
export const useNotificationState = createGlobalState<NotificationItem[]>();

export interface MenuState {
  expands: string[];
}
export const useMenuState = createGlobalState<MenuState>();
