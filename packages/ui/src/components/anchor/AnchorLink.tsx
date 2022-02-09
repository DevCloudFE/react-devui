import React, { useCallback } from 'react';

import { usePrefixConfig, useComponentConfig, useCustomContext, useRefCallback, useIsomorphicLayoutEffect } from '../../hooks';
import { generateComponentMate, getClassName, mergeStyle } from '../../utils';
import { DAnchorContext } from './Anchor';

export interface DAnchorLinkProps extends React.LiHTMLAttributes<HTMLLIElement> {
  dLevel?: number;
  dAProps?: React.AnchorHTMLAttributes<HTMLAnchorElement>;
}

const { COMPONENT_NAME } = generateComponentMate('DAnchorLink');
export function DAnchorLink(props: DAnchorLinkProps) {
  const { dLevel = 0, dAProps, className, children, onClick, ...restProps } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const [{ gUpdateLinks, gRemoveLinks, gActiveHref, gOnLinkClick }] = useCustomContext(DAnchorContext);
  //#endregion

  //#region Ref
  const [linkEl, linkRef] = useRefCallback<HTMLLIElement>();
  //#endregion

  const href = dAProps?.href;

  useIsomorphicLayoutEffect(() => {
    if (href && linkEl) {
      gUpdateLinks?.(href, linkEl);
      return () => {
        gRemoveLinks?.(href);
      };
    }
  }, [href, linkEl, gRemoveLinks, gUpdateLinks]);

  const handleClick = useCallback(
    (e) => {
      onClick?.(e);

      e.preventDefault();
      if (href) {
        gOnLinkClick?.(href);
      }
    },
    [href, onClick, gOnLinkClick]
  );

  return (
    <li {...restProps} ref={linkRef} className={getClassName(className, `${dPrefix}anchor-link`)} onClick={handleClick}>
      <a
        {...dAProps}
        className={getClassName(dAProps?.className, `${dPrefix}anchor-link__link`, {
          'is-active': href && gActiveHref === href,
        })}
        style={mergeStyle(
          {
            paddingLeft: 12 + dLevel * 16,
          },
          dAProps?.style
        )}
      >
        {children}
      </a>
    </li>
  );
}
