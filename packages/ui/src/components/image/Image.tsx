import React, { useRef } from 'react';

import { useForceUpdate } from '@react-devui/hooks';
import { getClassName } from '@react-devui/utils';

import { usePrefixConfig, useComponentConfig } from '../../hooks';
import { registerComponentMate } from '../../utils';
import { DImagePreview } from './ImagePreview';

export interface DImageProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dLoading?: React.ReactNode;
  dError?: React.ReactNode;
  dActions?: React.ReactNode[];
  dImgProps: React.ImgHTMLAttributes<HTMLImageElement>;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DImage' });
export const DImage: {
  (props: DImageProps): JSX.Element | null;
  Preview: typeof DImagePreview;
} = (props) => {
  const {
    dLoading,
    dError,
    dActions,
    dImgProps,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  const dataRef = useRef<{
    prevSrc?: string;
    isLoading: boolean;
    isError: boolean;
  }>({
    isLoading: true,
    isError: false,
  });

  const forceUpdate = useForceUpdate();

  if (dImgProps.src !== dataRef.current.prevSrc) {
    dataRef.current.prevSrc = dImgProps.src;
    dataRef.current.isLoading = true;
    dataRef.current.isError = false;
  }

  return (
    <div {...restProps} className={getClassName(restProps.className, `${dPrefix}image`)}>
      {dataRef.current.isLoading && dLoading}
      {dataRef.current.isError && dError}
      {
        // eslint-disable-next-line jsx-a11y/alt-text
        <img
          {...dImgProps}
          style={{
            ...dImgProps.style,
            display: (dataRef.current.isLoading && dLoading) || (dataRef.current.isError && dError) ? 'none' : undefined,
          }}
          onLoadStart={(e) => {
            // https://bugs.chromium.org/p/chromium/issues/detail?id=458851
            dImgProps.onLoadStart?.(e);

            dataRef.current.isLoading = true;
            forceUpdate();
          }}
          onLoad={(e) => {
            dImgProps.onLoad?.(e);

            dataRef.current.isLoading = false;
            forceUpdate();
          }}
          onError={(e) => {
            dImgProps.onError?.(e);

            dataRef.current.isLoading = false;
            dataRef.current.isError = true;
            forceUpdate();
          }}
        />
      }
      {dActions && (
        <div className={`${dPrefix}image__actions`}>
          {React.Children.map(dActions as any[], (action) =>
            React.cloneElement(action, {
              ...action.props,
              className: getClassName(action.props.className, `${dPrefix}image__action`),
            })
          )}
        </div>
      )}
    </div>
  );
};

DImage.Preview = DImagePreview;
