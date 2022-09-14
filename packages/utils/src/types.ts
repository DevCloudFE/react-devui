export type NestedItem<T extends object, K extends string = 'children'> = {
  [index in keyof T]: index extends K ? NestedItem<T, K>[] : T[index];
} & {
  [index in K]?: NestedItem<T, K>[];
};

export {};
