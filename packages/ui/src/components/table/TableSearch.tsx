import React, { useRef } from 'react';

import { useForceUpdate } from '@react-devui/hooks';
import { SearchOutlined } from '@react-devui/icons';
import { getClassName } from '@react-devui/utils';

import { useComponentConfig, useDValue, usePrefixConfig, useTranslation } from '../../hooks';
import { registerComponentMate } from '../../utils';
import { DButton } from '../button';
import { DInput } from '../input';
import { DPopover } from '../popover';

export interface DTableSearchRef {
  updatePosition: () => void;
}

export interface DTableSearchProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  dValue?: string;
  dVisible?: boolean;
  dPopupClassName?: string;
  onValueChange?: (value: string) => void;
  onVisibleChange?: (visible: boolean) => void;
  afterVisibleChange?: (visible: boolean) => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DTable.Search' as const });
function TableSearch(props: DTableSearchProps, ref: React.ForwardedRef<DTableSearchRef>): JSX.Element | null {
  const {
    dValue,
    dVisible,
    dPopupClassName,
    onValueChange,
    onVisibleChange,
    afterVisibleChange,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  const dataRef = useRef<{
    showValue: string;
    prevValue: string;
  }>({
    showValue: '',
    prevValue: '',
  });

  const [t] = useTranslation();
  const forceUpdate = useForceUpdate();

  const [_value, changeValue] = useDValue<string>('', dValue, onValueChange);
  if (_value !== dataRef.current.prevValue) {
    dataRef.current.showValue = dataRef.current.prevValue = _value;
  }

  return (
    <DPopover
      ref={ref}
      className={getClassName(dPopupClassName, `${dPrefix}table__filter-popup`)}
      onClick={(e) => {
        e.stopPropagation();
      }}
      dVisible={dVisible}
      dTrigger="click"
      dPlacement="bottom-right"
      dArrow={false}
      dContent={
        <DInput
          className={`${dPrefix}table__filter-search`}
          dModel={dataRef.current.showValue}
          dPrefix={<SearchOutlined />}
          dPlaceholder={t('Search')}
          onModelChange={(val) => {
            dataRef.current.showValue = val;
            forceUpdate();
          }}
        ></DInput>
      }
      dFooter={
        <DPopover.Footer
          dActions={[
            <DButton
              key="$$reset"
              onClick={() => {
                dataRef.current.showValue = '';
                forceUpdate();
              }}
              dType="link"
            >
              {t('Table', 'Reset')}
            </DButton>,
            'ok',
          ]}
        ></DPopover.Footer>
      }
      onVisibleChange={(visible) => {
        onVisibleChange?.(visible);

        if (!visible) {
          changeValue(dataRef.current.showValue);
        }
      }}
      afterVisibleChange={afterVisibleChange}
    >
      <button
        {...restProps}
        className={getClassName(restProps.className, {
          'is-active': dataRef.current.showValue.length > 0,
        })}
      >
        <SearchOutlined dSize={14} />
      </button>
    </DPopover>
  );
}

export const DTableSearch: (props: DTableSearchProps & React.RefAttributes<DTableSearchRef>) => ReturnType<typeof TableSearch> =
  React.forwardRef(TableSearch) as any;
