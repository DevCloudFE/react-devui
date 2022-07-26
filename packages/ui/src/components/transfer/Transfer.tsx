import type { DId } from '../../utils/global';
import type { DFormControl } from '../form';

import React, { useState, useCallback, useMemo } from 'react';

import { usePrefixConfig, useComponentConfig, useGeneralContext, useDValue } from '../../hooks';
import { LeftOutlined, RightOutlined } from '../../icons';
import { getClassName, registerComponentMate } from '../../utils';
import { DBaseDesign } from '../_base-design';
import { DButton } from '../button';
import { useFormControl } from '../form';
import { DTransferPanel } from './TransferPanel';

export const IS_SELECTED = Symbol();

export interface DTransferOption<V extends DId> {
  label: string;
  value: V;
  disabled?: boolean;
}

export interface DTransferProps<V extends DId, T extends DTransferOption<V>>
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dFormControl?: DFormControl;
  dModel?: V[];
  dSelected?: V[];
  dOptions: T[];
  dTitle?: [React.ReactNode?, React.ReactNode?];
  dActions?: React.ReactNode[];
  dLoading?: [boolean?, boolean?];
  dSearchable?: boolean;
  dDisabled?: boolean;
  dCustomOption?: (option: T) => React.ReactNode;
  dCustomSearch?: {
    filter?: (value: string, option: T) => boolean;
    sort?: (a: T, b: T) => number;
  };
  onModelChange?: (value: V[], option: T[]) => void;
  onSelectedChange?: (value: V[], option: T[]) => void;
  onSearch?: (value: string, direction: 'left' | 'right') => void;
  onScrollBottom?: (direction: 'left' | 'right') => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DTransfer' });
export function DTransfer<V extends DId, T extends DTransferOption<V>>(props: DTransferProps<V, T>): JSX.Element | null {
  const {
    dFormControl,
    dModel,
    dSelected,
    dOptions,
    dTitle,
    dActions = ['right', 'left'],
    dLoading = [false, false],
    dSearchable = false,
    dDisabled = false,
    dCustomOption,
    dCustomSearch,
    onModelChange,
    onSelectedChange,
    onSearch,
    onScrollBottom,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { gDisabled } = useGeneralContext();
  //#endregion

  const optionsMap = useMemo(() => new Map(dOptions.map((o) => [o.value, o])), [dOptions]);

  const formControlInject = useFormControl(dFormControl);
  const [_valueRight, changeValueRight] = useDValue<V[]>(
    [],
    dModel,
    (value) => {
      if (onModelChange) {
        onModelChange(
          value,
          value.map((v) => optionsMap.get(v)!)
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
        value.map((v) => optionsMap.get(v)!)
      );
    }
  });
  const selected = useMemo(() => new Set(_selected), [_selected]);

  const disabled = dDisabled || gDisabled || dFormControl?.control.disabled;

  const [searchValueLeft, setSearchValueLeft] = useState('');
  const [searchValueRight, setSearchValueRight] = useState('');

  const _filterFn = dCustomSearch?.filter;
  const filterFn = useCallback(
    (searchStr: string, option: T) => {
      const defaultFilterFn = (option: T) => {
        return option.label.includes(searchStr);
      };
      return _filterFn ? _filterFn(searchStr, option) : defaultFilterFn(option);
    },
    [_filterFn]
  );
  const sortFn = dCustomSearch?.sort;
  const [optionsLeft, optionsRight, selectedNumLeft, selectedNumRight, stateLeft, stateRight] = (() => {
    const optionsL: T[] = [];
    const optionsR: T[] = [];
    let selectedNumL = 0;
    let selectedNumR = 0;
    let noOptionsL = true;
    let hasSelectedL = false;
    let checkAllL = true;
    let noOptionsR = true;
    let hasSelectedR = false;
    let checkAllR = true;

    dOptions.forEach((option) => {
      const isLeft = !valueRight.has(option.value);
      const newOption = Object.assign({}, option);

      const searchValue = isLeft ? searchValueLeft : searchValueRight;
      if (!searchValue || filterFn(searchValue, option)) {
        newOption[IS_SELECTED] = false;
        if (selected.has(option.value)) {
          newOption[IS_SELECTED] = true;
          isLeft ? (selectedNumL += 1) : (selectedNumR += 1);
          if (!option.disabled) {
            isLeft ? (hasSelectedL = true) : (hasSelectedR = true);
          }
        } else {
          if (!option.disabled) {
            isLeft ? (checkAllL = false) : (checkAllR = false);
          }
        }

        if (isLeft) {
          optionsL.push(newOption);
          if (!option.disabled) {
            noOptionsL = false;
          }
        } else {
          optionsR.push(newOption);
          if (!option.disabled) {
            noOptionsR = false;
          }
        }
      }
    });

    if (searchValueLeft && sortFn) {
      optionsL.sort(sortFn);
    }
    if (searchValueRight && sortFn) {
      optionsR.sort(sortFn);
    }

    const stateL: boolean | 'mixed' = noOptionsL ? false : checkAllL ? true : hasSelectedL ? 'mixed' : false;
    const stateR: boolean | 'mixed' = noOptionsR ? false : checkAllR ? true : hasSelectedR ? 'mixed' : false;

    return [optionsL, optionsR, selectedNumL, selectedNumR, stateL, stateR];
  })();

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
      for (const option of isLeft ? optionsLeft : optionsRight) {
        if (option.disabled) {
          continue;
        }

        if (isSelected && !option[IS_SELECTED]) {
          newSelected.add(option.value);
        } else if (!isSelected && option[IS_SELECTED]) {
          newSelected.delete(option.value);
        }
      }
      return Array.from(newSelected);
    });
  };

  const handleButtonClick = (isLeft: boolean) => {
    changeValueRight((draft) => {
      const newValueRight = new Set(draft);
      (isLeft ? optionsLeft : optionsRight).forEach((option) => {
        if (option[IS_SELECTED]) {
          if (isLeft) {
            newValueRight.add(option.value);
          } else {
            newValueRight.delete(option.value);
          }
        }
      });
      return Array.from(newValueRight);
    });

    changeSelected((draft) => {
      const newSelected = new Set(draft);
      (isLeft ? optionsLeft : optionsRight).forEach((option) => {
        if (option[IS_SELECTED]) {
          newSelected.delete(option.value);
        }
      });
      return Array.from(newSelected);
    });
  };

  return (
    <DBaseDesign dFormControl={dFormControl}>
      <div
        {...restProps}
        className={getClassName(restProps.className, `${dPrefix}transfer`, {
          'is-disabled': disabled,
        })}
      >
        <DTransferPanel
          dOptions={optionsLeft}
          dSelectedNum={selectedNumLeft}
          dState={stateLeft}
          dTitle={dTitle?.[0]}
          dLoading={dLoading[0]}
          dSearchable={dSearchable}
          dCustomOption={dCustomOption}
          onSelectedChange={handleSelectedChange}
          onAllSelected={(selected) => {
            handleAllSelected(selected, true);
          }}
          onSearch={(val) => {
            setSearchValueLeft(val);
            onSearch?.(val, 'left');
          }}
          onScrollBottom={() => {
            onScrollBottom?.('left');
          }}
        ></DTransferPanel>
        <div className={`${dPrefix}transfer__actions`}>
          {React.Children.map(dActions, (action) =>
            action === 'right' ? (
              <DButton
                key="$$right"
                disabled={stateLeft === false}
                dType="secondary"
                dIcon={<RightOutlined />}
                onClick={() => {
                  handleButtonClick(true);
                }}
              ></DButton>
            ) : action === 'left' ? (
              <DButton
                key="$$left"
                disabled={stateRight === false}
                dType="secondary"
                dIcon={<LeftOutlined />}
                onClick={() => {
                  handleButtonClick(false);
                }}
              ></DButton>
            ) : (
              action
            )
          )}
        </div>
        <DTransferPanel
          dOptions={optionsRight}
          dSelectedNum={selectedNumRight}
          dState={stateRight}
          dTitle={dTitle?.[1]}
          dLoading={dLoading[1]}
          dSearchable={dSearchable}
          dCustomOption={dCustomOption}
          onSelectedChange={handleSelectedChange}
          onAllSelected={(selected) => {
            handleAllSelected(selected, false);
          }}
          onSearch={(val) => {
            setSearchValueRight(val);
            onSearch?.(val, 'right');
          }}
          onScrollBottom={() => {
            onScrollBottom?.('right');
          }}
        ></DTransferPanel>
      </div>
    </DBaseDesign>
  );
}
