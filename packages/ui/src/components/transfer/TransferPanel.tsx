import type { DId } from '../../utils/global';
import type { DVirtualScrollRef } from '../virtual-scroll';
import type { DTransferOption } from './Transfer';

import React, { useId, useCallback, useRef } from 'react';

import { usePrefixConfig, useTranslation } from '../../hooks';
import { LoadingOutlined, SearchOutlined } from '../../icons';
import { getClassName } from '../../utils';
import { DCheckbox } from '../checkbox';
import { DEmpty } from '../empty';
import { DInput } from '../input';
import { DVirtualScroll } from '../virtual-scroll';
import { IS_SELECTED } from './Transfer';

export interface DTransferPanelProps<V extends DId, T extends DTransferOption<V>> {
  dOptions: T[];
  dSelectedNum: number;
  dState: boolean | 'mixed';
  dTitle?: React.ReactNode;
  dLoading?: boolean;
  dSearchable?: boolean;
  dCustomOption?: (option: T) => React.ReactNode;
  onSelectedChange: (value: V) => void;
  onAllSelected: (selected: boolean) => void;
  onSearch: (value: string) => void;
  onScrollBottom: () => void;
}

export function DTransferPanel<V extends DId, T extends DTransferOption<V>>(props: DTransferPanelProps<V, T>): JSX.Element | null {
  const {
    dOptions,
    dSelectedNum,
    dState,
    dTitle,
    dLoading = false,
    dSearchable = false,
    dCustomOption,
    onSelectedChange,
    onAllSelected,
    onSearch,
    onScrollBottom,
  } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  //#region Ref
  const dVSRef = useRef<DVirtualScrollRef<T>>(null);
  //#endregion

  const [t] = useTranslation();

  const uniqueId = useId();
  const getOptionId = (val: V) => `${dPrefix}transfer-option-${val}-${uniqueId}`;

  const canSelectOption = useCallback((option: T) => !option.disabled, []);

  return (
    <div className={`${dPrefix}transfer__panel`}>
      <div className={`${dPrefix}transfer__header`}>
        <DCheckbox
          dDisabled={dOptions.length === 0}
          dModel={dState !== 'mixed' ? dState : undefined}
          dIndeterminate={dState === 'mixed'}
          onModelChange={(checked) => {
            onAllSelected(checked);
          }}
        ></DCheckbox>
        <div className={`${dPrefix}transfer__header-statistic`}>
          {dSelectedNum}/{dOptions.length}
        </div>
        {dTitle && <div className={`${dPrefix}transfer__header-title`}>{dTitle}</div>}
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
          ref={dVSRef}
          className={`${dPrefix}transfer__list`}
          dList={dOptions}
          dItemRender={(item, index, renderProps) => {
            const { label: optionLabel, value: optionValue, disabled: optionDisabled } = item;

            const optionNode = dCustomOption ? dCustomOption(item) : optionLabel;

            return (
              <li
                {...renderProps}
                key={optionValue}
                id={getOptionId(optionValue)}
                className={getClassName(`${dPrefix}transfer__option`, {
                  'is-disabled': optionDisabled,
                })}
                title={optionLabel}
                onClick={() => {
                  if (!optionDisabled) {
                    onSelectedChange?.(optionValue);
                  }
                }}
              >
                <DCheckbox dDisabled={optionDisabled} dModel={item[IS_SELECTED]}></DCheckbox>
                <div className={`${dPrefix}transfer__option-content`}>{optionNode}</div>
              </li>
            );
          }}
          dItemSize={32}
          dCompareItem={(a, b) => a.value === b.value}
          dFocusable={canSelectOption}
          dSize={192}
          dEmpty={<DEmpty className={`${dPrefix}transfer__empty`}></DEmpty>}
          onScrollEnd={onScrollBottom}
        ></DVirtualScroll>
      </div>
    </div>
  );
}
