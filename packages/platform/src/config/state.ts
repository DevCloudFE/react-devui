import type { Control, ControlMode } from '../app/hooks/useACL';
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

export interface MenuItem extends Omit<DMenuItem<string>, 'icon' | 'children'> {
  icon?: React.FunctionComponent;
  acl?:
    | {
        control: Control | Control[];
        mode?: ControlMode;
      }
    | Control
    | Control[];
  children?: MenuItem[];
}
export const useMenuState = createGlobalState<MenuItem[]>();
