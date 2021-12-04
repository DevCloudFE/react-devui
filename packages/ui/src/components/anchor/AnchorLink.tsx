import React, { useCallback, useEffect } from 'react';

import { useDPrefixConfig, useDComponentConfig, useCustomContext, useRefCallback } from '../../hooks';
import { getClassName } from '../../utils';
import { DAnchorContext } from './Anchor';

export interface DAnchorLinkProps extends React.LiHTMLAttributes<HTMLLIElement> {
  dLevel?: number;
  href?: string;
}

export function DAnchorLink(props: DAnchorLinkProps) {
  const { dLevel = 0, href, className, children, onClick, ...restProps } = useDComponentConfig(DAnchorLink.name, props);

  //#region Context
  const dPrefix = useDPrefixConfig();
  const [{ anchorActiveHref, onLinkChange, onLinkClick }] = useCustomContext(DAnchorContext);
  //#endregion

  //#region Ref
  const [linkEl, linkRef] = useRefCallback<HTMLLIElement>();
  //#endregion

  const handleClick = useCallback(
    (e) => {
      onClick?.(e);

      e.preventDefault();
      if (href) {
        onLinkClick?.(href);
      }
    },
    [href, onClick, onLinkClick]
  );

  //#region DidUpdate
  useEffect(() => {
    if (linkEl && href) {
      onLinkChange?.(href, linkEl);
      return () => {
        onLinkChange?.(href);
      };
    }
  }, [href, linkEl, onLinkChange]);
  //#endregion

  return (
    <li {...restProps} ref={linkRef} className={getClassName(className, `${dPrefix}anchor-link`)} onClick={handleClick}>
      <a
        className={getClassName(`${dPrefix}anchor-link__link`, {
          'is-active': href && anchorActiveHref === href,
        })}
        style={{ paddingLeft: 12 + dLevel * 16 }}
        href={href}
      >
        {children}
      </a>
    </li>
  );
}
