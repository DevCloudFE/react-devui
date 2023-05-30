export type AppTheme = 'light' | 'dark';

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

export interface StandardQueryParams {
  sort?: string;
  page?: number;
  page_size?: number;
  [index: string]: any;
}

export interface StandardFields {
  id: number;
  create_time: number;
  update_time: number;
}

export interface DeviceDoc extends StandardFields {
  name: string;
  model: string;
  price: number;
  status: number;
}

export {};
