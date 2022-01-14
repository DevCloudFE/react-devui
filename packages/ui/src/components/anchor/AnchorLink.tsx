import React, { useCallback } from 'react';

import { usePrefixConfig, useComponentConfig, useCustomContext, useRefCallback, useStateBackflow } from '../../hooks';
import { generateComponentMate, getClassName } from '../../utils';
import { DAnchorContext } from './Anchor';

export interface DAnchorLinkProps extends React.LiHTMLAttributes<HTMLLIElement> {
  dLevel?: number;
  href?: string;
}

const { COMPONENT_NAME } = generateComponentMate('DAnchorLink');
export function DAnchorLink(props: DAnchorLinkProps) {
  const { dLevel = 0, href, className, children, onClick, ...restProps } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const [{ updateLinks, removeLinks, anchorActiveHref, onLinkClick }] = useCustomContext(DAnchorContext);
  //#endregion

  //#region Ref
  const [linkEl, linkRef] = useRefCallback<HTMLLIElement>();
  //#endregion

  useStateBackflow(updateLinks, removeLinks, href, linkEl);

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
