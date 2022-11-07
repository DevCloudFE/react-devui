import type { StandardFields } from './api/types';

import { useImmer } from '@react-devui/hooks';

export interface TableConfig<T> {
  loading: boolean;
  list: T[];
  totalSize: number;
  selected: Set<number>;
}

const DEFAULT_TABLE: TableConfig<any> = {
  loading: true,
  list: [],
  totalSize: 0,
  selected: new Set(),
};

export function useTable<T extends StandardFields = any>(defaultConfig?: TableConfig<T>) {
  const [table, setTable] = useImmer<TableConfig<T>>({
    ...DEFAULT_TABLE,
    ...defaultConfig,
  });

  const allSelected: boolean | 'mixed' = table.selected.size === 0 ? false : table.selected.size === table.list.length ? true : 'mixed';
  const handleAllSelected = (selected: boolean) => {
    setTable((draft) => {
      draft.selected = new Set(selected ? draft.list.map((data) => data.id) : []);
    });
  };

  return {
    ...table,
    set: setTable,
    allSelected,
    handleAllSelected,
  };
}
