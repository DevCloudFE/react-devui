export interface StandardFields {
  id: number;
  create_time: number;
  update_time: number;
}

export interface ErrorStandardFields {
  error: {
    code: string;
    message: string;
  };
}

export interface StandardGetParams {
  sort?: string;
  page?: number;
  page_size?: number;
}

export interface StandardListRes<T> {
  resources: T[];
  metadata: {
    page: number;
    page_size: number;
    total_size: number;
  };
}

export interface DeviceDoc extends StandardFields {
  name: string;
  model: string;
  price: number;
  status: number;
}

export {};
