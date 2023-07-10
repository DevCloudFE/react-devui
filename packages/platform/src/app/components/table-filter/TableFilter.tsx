import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DownOutlined } from '@react-devui/icons';
import { DInput, DButton, DSeparator, DBadge } from '@react-devui/ui';
import { useDValue } from '@react-devui/ui/hooks';
import { getClassName } from '@react-devui/utils';

export interface AppTableFilterProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  aFilterList?: { label: string; node: React.ReactElement; isEmpty: boolean }[];
  aSearchValue?: string;
  aSearchPlaceholder?: string;
  onSearchValueChange?: (value: string) => void;
  onSearchClick?: () => void;
  onResetClick?: () => void;
}

export function AppTableFilter(props: AppTableFilterProps): JSX.Element | null {
  const {
    aFilterList,
    aSearchValue,
    aSearchPlaceholder,
    onSearchValueChange,
    onSearchClick,
    onResetClick,

    ...restProps
  } = props;

  const { t } = useTranslation();

  const [searchValue, changeSearchValue] = useDValue<string>('', aSearchValue, onSearchValueChange);

  const badgeValue = aFilterList ? aFilterList.filter((item) => !item.isEmpty).length : 0;

  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  return (
    <div {...restProps} className={getClassName(restProps.className, 'app-table-filter')}>
      <div className="app-table-filter__search">
        <DInput
          className="app-table-filter__search-input"
          dModel={searchValue}
          dPlaceholder={aSearchPlaceholder}
          dInputRender={(el) =>
            React.cloneElement<React.InputHTMLAttributes<HTMLInputElement>>(el, {
              onKeyDown: (e) => {
                el.props.onKeyDown?.(e);

                if (e.code === 'Enter') {
                  e.preventDefault();
                  onSearchClick?.();
                }
              },
            })
          }
          onModelChange={changeSearchValue}
        />
        <div className="app-table-filter__button-container">
          <DButton onClick={onSearchClick}>{t('components.table-filter.Search')}</DButton>
          <DButton onClick={onResetClick} dType="secondary">
            {t('components.table-filter.Reset')}
          </DButton>
          {aFilterList && (
            <div className="d-flex align-items-center">
              <DButton
                className="me-2"
                dType="link"
                onClick={() => {
                  setShowAdvancedSearch((prevShowAdvancedSearch) => !prevShowAdvancedSearch);
                }}
              >
                <div className="d-flex align-items-center">
                  {t('components.table-filter.Advanced Search')}
                  <DownOutlined className="ms-1" dSize={12} dRotate={showAdvancedSearch ? 180 : 0} />
                </div>
              </DButton>
              <DBadge dValue={badgeValue} dTheme="primary" dAlone />
            </div>
          )}
        </div>
      </div>
      {aFilterList && showAdvancedSearch && (
        <>
          <DSeparator></DSeparator>
          {aFilterList.map(({ label, node }) => (
            <div key={label} className="app-table-filter__filter">
              <label className="app-table-filter__filter-label">{label}</label>
              {node}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
