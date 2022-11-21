import type { DNotificationProps, DToastProps } from '@react-devui/ui';

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

export const useNotifications = createGlobalState<(DNotificationProps & { key: string | number })[]>([]);

export const useToasts = createGlobalState<(DToastProps & { key: string | number })[]>([]);
