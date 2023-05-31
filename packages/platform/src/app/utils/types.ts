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

export {};
