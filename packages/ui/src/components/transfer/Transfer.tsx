import type { DId } from '../../utils/types';
import type { DFormControl } from '../form';

import React, { useCallback, useMemo } from 'react';

import { LeftOutlined, RightOutlined } from '@react-devui/icons';
import { getClassName } from '@react-devui/utils';

import { useGeneralContext, useDValue } from '../../hooks';
import { registerComponentMate } from '../../utils';
import { DBaseDesign } from '../_base-design';
import { DButton } from '../button';
import { useFormControl } from '../form';
import { useComponentConfig, usePrefixConfig } from '../root';
import { DPanel } from './Panel';

export const IS_SELECTED = Symbol();

export interface DTransferItem<V extends DId> {
  label: string;
  value: V;
  disabled?: boolean;
}

export interface DTransferProps<V extends DId, T extends DTransferItem<V>> extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dFormControl?: DFormControl;
  dList: T[];
  dModel?: V[];
  dSelected?: V[];
  dTitle?: [React.ReactNode?, React.ReactNode?];
  dActions?: React.ReactNode[];
  dLoading?: [boolean?, boolean?];
  dSearchable?: boolean;
  dSearchValue?: [string, string];
  dDisabled?: boolean;
  dVirtual?: boolean;
  dCustomItem?: (item: T) => React.ReactNode;
  dCustomSearch?: {
    filter?: (value: string, item: T) => boolean;
    sort?: (a: T, b: T) => number;
  };
  onModelChange?: (value: T['value'][], item: (T | undefined)[]) => void;
  onSelectedChange?: (value: T['value'][], item: (T | undefined)[]) => void;
  onSearchValueChange?: (value: [string, string]) => void;
  onScrollBottom?: (direction: 'left' | 'right') => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DTransfer' as const });
export function DTransfer<V extends DId, T extends DTransferItem<V>>(props: DTransferProps<V, T>): JSX.Element | null {
  const {
    dFormControl,
    dList,
    dModel,
    dSelected,
    dTitle,
    dActions = ['right', 'left'],
    dLoading = [false, false],
    dSearchable = false,
    dSearchValue,
    dDisabled = false,
    dVirtual = false,
    dCustomItem,
    dCustomSearch,
    onModelChange,
    onSelectedChange,
    onSearchValueChange,
    onScrollBottom,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { gDisabled } = useGeneralContext();
  //#endregion

  const itemsMap = useMemo(() => new Map(dList.map((item) => [item.value, item])), [dList]);

  const formControlInject = useFormControl(dFormControl);
  const [_valueRight, changeValueRight] = useDValue<V[]>(
    [],
    dModel,
    (value) => {
      if (onModelChange) {
        onModelChange(
          value,
          value.map((v) => itemsMap.get(v))
        );
      }
    },
    undefined,
    formControlInject
  );
  const valueRight = useMemo(() => new Set(_valueRight), [_valueRight]);

  const [_selected, changeSelected] = useDValue<V[]>([], dSelected, (value) => {
    if (onSelectedChange) {
      onSelectedChange(
        value,
        value.map((v) => itemsMap.get(v))
      );
    }
  });
  const selected = useMemo(() => new Set(_selected), [_selected]);

  const disabled = dDisabled || gDisabled || dFormControl?.control.disabled;

  const [searchValues, changeSearchValue] = useDValue<[string, string]>(['', ''], dSearchValue, onSearchValueChange);

  const _filterFn = dCustomSearch?.filter;
  const filterFn = useCallback(
    (searchStr: string, item: T) => {
      const defaultFilterFn = (item: T) => {
        return item.label.includes(searchStr);
      };
      return _filterFn ? _filterFn(searchStr, item) : defaultFilterFn(item);
    },
    [_filterFn]
  );
  const sortFn = dCustomSearch?.sort;
  const [listLeft, listRight, selectedNumLeft, selectedNumRight, stateLeft, stateRight] = useMemo(() => {
    const listL: T[] = [];
    const listR: T[] = [];
    let selectedNumL = 0;
    let selectedNumR = 0;
    let emptyL = true;
    let hasSelectedL = false;
    let checkAllL = true;
    let emptyR = true;
    let hasSelectedR = false;
    let checkAllR = true;

    dList.forEach((item) => {
      const isLeft = !valueRight.has(item.value);
      const newItem = Object.assign({}, item);

      const searchValue = searchValues[isLeft ? 0 : 1];
      if (!searchValue || filterFn(searchValue, item)) {
        newItem[IS_SELECTED] = false;
        if (selected.has(item.value)) {
          newItem[IS_SELECTED] = true;
          isLeft ? (selectedNumL += 1) : (selectedNumR += 1);
          if (!item.disabled) {
            isLeft ? (hasSelectedL = true) : (hasSelectedR = true);
          }
        } else {
          if (!item.disabled) {
            isLeft ? (checkAllL = false) : (checkAllR = false);
          }
        }

        if (isLeft) {
          listL.push(newItem);
          if (!item.disabled) {
            emptyL = false;
          }
        } else {
          listR.push(newItem);
          if (!item.disabled) {
            emptyR = false;
          }
        }
      }
    });

    if (searchValues[0] && sortFn) {
      listL.sort(sortFn);
    }
    if (searchValues[1] && sortFn) {
      listR.sort(sortFn);
    }

    const stateL: boolean | 'mixed' = emptyL ? false : checkAllL ? true : hasSelectedL ? 'mixed' : false;
    const stateR: boolean | 'mixed' = emptyR ? false : checkAllR ? true : hasSelectedR ? 'mixed' : false;

    return [listL, listR, selectedNumL, selectedNumR, stateL, stateR];
  }, [dList, filterFn, searchValues, selected, sortFn, valueRight]);

  const handleSelectedChange = (val: V) => {
    changeSelected((draft) => {
      const index = draft.findIndex((v) => v === val);
      if (index !== -1) {
        draft.splice(index, 1);
      } else {
        draft.push(val as V);
      }
    });
  };

  const handleAllSelected = (isSelected: boolean, isLeft: boolean) => {
    changeSelected((draft) => {
      const newSelected = new Set(draft);
      for (const item of isLeft ? listLeft : listRight) {
        if (item.disabled) {
          continue;
        }

        if (isSelected && !item[IS_SELECTED]) {
          newSelected.add(item.value);
        } else if (!isSelected && item[IS_SELECTED]) {
          newSelected.delete(item.value);
        }
      }
      return Array.from(newSelected);
    });
  };

  const handleButtonClick = (isLeft: boolean) => {
    changeValueRight((draft) => {
      const newValueRight = new Set(draft);
      (isLeft ? listLeft : listRight).forEach((item) => {
        if (item[IS_SELECTED]) {
          if (isLeft) {
            newValueRight.add(item.value);
          } else {
            newValueRight.delete(item.value);
          }
        }
      });
      return Array.from(newValueRight);
    });

    changeSelected((draft) => {
      const newSelected = new Set(draft);
      (isLeft ? listLeft : listRight).forEach((item) => {
        if (item[IS_SELECTED]) {
          newSelected.delete(item.value);
        }
      });
      return Array.from(newSelected);
    });
  };

  return (
    <DBaseDesign
      dComposeDesign={false}
      dFormDesign={{
        control: dFormControl,
      }}
    >
      {({ render: renderBaseDesign }) =>
        renderBaseDesign(
          <div
            {...restProps}
            className={getClassName(restProps.className, `${dPrefix}transfer`, {
              'is-disabled': disabled,
            })}
          >
            <DPanel
              dList={listLeft}
              dSelectedNum={selectedNumLeft}
              dState={stateLeft}
              dTitle={dTitle?.[0]}
              dLoading={dLoading[0] ?? false}
              dSearchable={dSearchable}
              dVirtual={dVirtual}
              dCustomItem={dCustomItem}
              onSelectedChange={handleSelectedChange}
              onAllSelected={(selected) => {
                handleAllSelected(selected, true);
              }}
              onSearch={(val) => {
                changeSearchValue((draft) => {
                  draft[0] = val;
                });
              }}
              onScrollBottom={() => {
                onScrollBottom?.('left');
              }}
            ></DPanel>
            <div className={`${dPrefix}transfer__actions`}>
              {React.Children.map(dActions, (action) =>
                action === 'right' ? (
                  <DButton
                    key="$$right"
                    disabled={stateLeft === false}
                    onClick={() => {
                      handleButtonClick(true);
                    }}
                    dType="secondary"
                    dIcon={<RightOutlined />}
                  ></DButton>
                ) : action === 'left' ? (
                  <DButton
                    key="$$left"
                    disabled={stateRight === false}
                    onClick={() => {
                      handleButtonClick(false);
                    }}
                    dType="secondary"
                    dIcon={<LeftOutlined />}
                  ></DButton>
                ) : (
                  action
                )
              )}
            </div>
            <DPanel
              dList={listRight}
              dSelectedNum={selectedNumRight}
              dState={stateRight}
              dTitle={dTitle?.[1]}
              dLoading={dLoading[1] ?? false}
              dSearchable={dSearchable}
              dVirtual={dVirtual}
              dCustomItem={dCustomItem}
              onSelectedChange={handleSelectedChange}
              onAllSelected={(selected) => {
                handleAllSelected(selected, false);
              }}
              onSearch={(val) => {
                changeSearchValue((draft) => {
                  draft[1] = val;
                });
              }}
              onScrollBottom={() => {
                onScrollBottom?.('right');
              }}
            ></DPanel>
          </div>
        )
      }
    </DBaseDesign>
  );
}
