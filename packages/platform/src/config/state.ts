import type { DMenuItem } from '@react-devui/ui/components/menu';

import { createGlobalState } from '@react-devui/hooks';

export interface UserState {
  name: string;
  avatar: string;
  role: 'admin';
  permission: string[];
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
  menu: DMenuItem<string>[];
  expands: string[];
}
export const useMenuState = createGlobalState<MenuState>({ menu: [], expands: [] });
