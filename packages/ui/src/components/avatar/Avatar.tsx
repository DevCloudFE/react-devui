import React, { useEffect, useRef, useState } from 'react';

import { usePrefixConfig, useComponentConfig } from '../../hooks';
import { registerComponentMate, getClassName } from '../../utils';

export interface DAvatarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dShape?: string | number;
  dImg?: React.ImgHTMLAttributes<HTMLImageElement>;
  dIcon?: React.ReactNode;
  dText?: React.ReactNode;
  dSize?: number;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DAvatar' });
export function DAvatar(props: DAvatarProps): JSX.Element | null {
  const {
    dShape = 'circular',
    dImg,
    dIcon,
    dText,
    dSize = 40,

    className,
    style,
    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  //#region Ref
  const textRef = useRef<HTMLSpanElement>(null);
  //#endregion

  const [imgError, setImgError] = useState(false);
  const type: 'img' | 'icon' | 'text' = dImg && !imgError ? 'img' : dIcon ? 'icon' : dText ? 'text' : 'img';

  useEffect(() => {
    if (textRef.current) {
      const maxWidth = Math.sqrt(Math.pow(dSize / 2, 2) - Math.pow(textRef.current.clientHeight / 2, 2)) * 2;
      if (textRef.current.clientWidth > maxWidth) {
        textRef.current.style.cssText = `transform:scale(${maxWidth / textRef.current.clientWidth});`;
      }
    }
  });

  return (
    <div
      {...restProps}
      className={getClassName(className, `${dPrefix}avatar`, `${dPrefix}avatar--${type}`, {
        [`${dPrefix}avatar--${dShape}`]: dShape === 'circular' || dShape === 'square',
      })}
      style={{
        ...style,
        width: dSize,
        height: dSize,
        fontSize: type === 'icon' ? dSize / 2 : type === 'text' ? dSize * 0.45 : undefined,
        borderRadius: dShape === 'circular' || dShape === 'square' ? undefined : dShape,
      }}
    >
      {type === 'img' ? (
        // eslint-disable-next-line jsx-a11y/alt-text
        <img
          {...dImg}
          className={getClassName(dImg?.className, `${dPrefix}avatar__img`)}
          onError={(e) => {
            dImg?.onError?.(e);

            setImgError(true);
          }}
        />
      ) : type === 'icon' ? (
        dIcon
      ) : (
        <span ref={textRef}>{dText}</span>
      )}
    </div>
  );
}
