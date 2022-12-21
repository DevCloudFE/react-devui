export type OpenSettingFn<T> = (doc?: T) => void;

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
