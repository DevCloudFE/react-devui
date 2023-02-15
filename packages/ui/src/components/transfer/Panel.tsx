import type { DId } from '../../utils/types';
import type { DVirtualScrollPerformance, DVirtualScrollRef } from '../virtual-scroll';
import type { DTransferItem } from './Transfer';

import React, { useCallback, useRef, useMemo } from 'react';

import { useId } from '@react-devui/hooks';
import { LoadingOutlined, SearchOutlined } from '@react-devui/icons';
import { checkNodeExist, getClassName } from '@react-devui/utils';

import { DCheckbox } from '../checkbox';
import { DEmpty } from '../empty';
import { DInput } from '../input';
import { usePrefixConfig, useTranslation } from '../root';
import { DVirtualScroll } from '../virtual-scroll';
import { IS_SELECTED } from './Transfer';

export interface DPanelProps<V extends DId, T extends DTransferItem<V>> {
  dList: T[];
  dSelectedNum: number;
  dState: boolean | 'mixed';
  dTitle: React.ReactNode;
  dLoading: boolean;
  dSearchable: boolean;
  dVirtual: boolean;
  dCustomItem: ((item: T) => React.ReactNode) | undefined;
  onSelectedChange: (value: V) => void;
  onAllSelected: (selected: boolean) => void;
  onSearch: (value: string) => void;
  onScrollBottom: () => void;
}

export function DPanel<V extends DId, T extends DTransferItem<V>>(props: DPanelProps<V, T>): JSX.Element | null {
  const {
    dList,
    dSelectedNum,
    dState,
    dTitle,
    dLoading,
    dSearchable,
    dVirtual,
    dCustomItem,
    onSelectedChange,
    onAllSelected,
    onSearch,
    onScrollBottom,
  } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  //#region Ref
  const vsRef = useRef<DVirtualScrollRef<T>>(null);
  //#endregion

  const [t] = useTranslation();

  const uniqueId = useId();
  const getItemId = (val: V) => `${dPrefix}transfer-item-${val}-${uniqueId}`;

  const canSelectItem = useCallback((item: T) => !item.disabled, []);

  const vsPerformance = useMemo<DVirtualScrollPerformance<T>>(
    () => ({
      dList,
      dItemSize: 32,
      dItemKey: (item) => item.value,
      dFocusable: canSelectItem,
    }),
    [canSelectItem, dList]
  );

  return (
    <div className={`${dPrefix}transfer__panel`}>
      <div className={`${dPrefix}transfer__header`}>
        <DCheckbox
          dDisabled={dList.length === 0}
          dModel={dState !== 'mixed' ? dState : undefined}
          dIndeterminate={dState === 'mixed'}
          onModelChange={(checked) => {
            onAllSelected(checked);
          }}
        >
          {dSelectedNum}/{dList.length}
        </DCheckbox>
        {checkNodeExist(dTitle) && <div className={`${dPrefix}transfer__header-title`}>{dTitle}</div>}
      </div>
      {dSearchable && (
        <DInput
          className={`${dPrefix}transfer__search`}
          dPrefix={<SearchOutlined />}
          dPlaceholder={t('Search')}
          onModelChange={onSearch}
        ></DInput>
      )}
      <div className={`${dPrefix}transfer__list-container`}>
        {dLoading && (
          <div className={`${dPrefix}transfer__loading`}>
            <LoadingOutlined dSize={24} dSpin />
          </div>
        )}
        <DVirtualScroll
          {...vsPerformance}
          ref={vsRef}
          dFillNode={<li></li>}
          dItemRender={(item, index, { aria }) => {
            const { label: itemLabel, value: itemValue, disabled: itemDisabled } = item;

            return (
              <li
                {...aria}
                key={itemValue}
                id={getItemId(itemValue)}
                className={getClassName(`${dPrefix}transfer__option`, {
                  'is-disabled': itemDisabled,
                })}
                title={itemLabel}
                onClick={() => {
                  if (!itemDisabled) {
                    onSelectedChange?.(itemValue);
                  }
                }}
              >
                <DCheckbox dDisabled={itemDisabled} dModel={item[IS_SELECTED]}></DCheckbox>
                <div className={`${dPrefix}transfer__option-content`}>{dCustomItem ? dCustomItem(item) : itemLabel}</div>
              </li>
            );
          }}
          dSize={dVirtual ? 192 : Infinity}
          onScrollEnd={onScrollBottom}
        >
          {({ render, vsList }) =>
            render(
              <ul className={`${dPrefix}transfer__list`} style={{ pointerEvents: dLoading ? 'none' : undefined }}>
                {dList.length === 0 ? <DEmpty className={`${dPrefix}transfer__empty`}></DEmpty> : vsList}
              </ul>
            )
          }
        </DVirtualScroll>
      </div>
    </div>
  );
}
