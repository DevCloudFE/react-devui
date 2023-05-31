interface StandardFields {
  id: number;
  create_time: number;
  update_time: number;
}

declare global {
  declare namespace AppDocs {
    export interface Device extends StandardFields {
      name: string;
      model: string;
      price: number;
      status: number;
    }
  }
}

export {};
