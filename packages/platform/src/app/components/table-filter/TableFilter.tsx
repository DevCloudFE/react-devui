import { isNumber, isUndefined } from 'lodash';
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
  aLabelWidth?: string | number;
  onSearchValueChange?: (value: string) => void;
  onSearchClick?: () => void;
  onResetClick?: () => void;
}

export function AppTableFilter(props: AppTableFilterProps): JSX.Element | null {
  const {
    aFilterList,
    aSearchValue,
    aSearchPlaceholder,
    aLabelWidth,
    onSearchValueChange,
    onSearchClick,
    onResetClick,

    ...restProps
  } = props;

  const { t } = useTranslation();

  const [searchValue, changeSearchValue] = useDValue<string>('', aSearchValue, onSearchValueChange);

  const [labelWidth, badgeValue] = (() => {
    let maxLength = 0;
    let badgeValue = 0;
    if (aFilterList) {
      aFilterList.forEach((item) => {
        maxLength = Math.max(item.label.length, maxLength);
        if (!item.isEmpty) {
          badgeValue += 1;
        }
      });
    }

    return [isUndefined(aLabelWidth) ? maxLength + 1 + 'em' : aLabelWidth, badgeValue] as const;
  })();

  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  return (
    <div {...restProps} className={getClassName(restProps.className, 'app-table-filter')}>
      <div className="app-table-filter__search">
        <DInput
          className="app-table-filter__search-input"
          dModel={searchValue}
          dPlaceholder={aSearchPlaceholder}
          onModelChange={changeSearchValue}
        />
        <div className="app-table-filter__button-container">
          <DButton onClick={onSearchClick}>{t('components.table-filter.Search')}</DButton>
          <DButton onClick={onResetClick} dType="secondary">
            {t('components.table-filter.Reset')}
          </DButton>
          {aFilterList && (
            <div className="d-flex align-items-center" style={{ width: 120 }}>
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
              <label className="app-table-filter__filter-label">
                <div className="app-colon" style={{ width: labelWidth }}>
                  {label}
                </div>
              </label>
              {React.cloneElement(node, {
                style: { ...node.props.style, maxWidth: `calc(100% - ${isNumber(labelWidth) ? labelWidth + 'px' : labelWidth})` },
              })}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
