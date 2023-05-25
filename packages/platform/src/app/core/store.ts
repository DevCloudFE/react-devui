import type { DNotificationProps, DToastProps } from '@react-devui/ui';

import { createStore } from 'rcl-store';

export interface AppUser {
  name: string;
  avatar?: string;
  permission: (string | number)[];
}

export interface AppNotification {
  id: string;
  title: string;
  list: {
    message: string;
    read: boolean;
  }[];
}

export interface AppMenu {
  expands?: string[];
}

export const GlobalStore = createStore<{
  appUser: AppUser;
  appNotifications: AppNotification[] | undefined;
  appMenu: AppMenu;
  notifications: (DNotificationProps & { key: string | number })[];
  toasts: (DToastProps & { key: string | number })[];
  dialogs: { key: string | number; type: any; props: any }[];
}>({
  appUser: {} as any,
  appNotifications: undefined,
  appMenu: {},
  notifications: [],
  toasts: [],
  dialogs: [],
});
