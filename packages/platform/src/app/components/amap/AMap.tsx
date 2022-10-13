import AMapLoader from '@amap/amap-jsapi-loader';
import { isNull, isUndefined } from 'lodash';
import React, { useCallback, useRef } from 'react';

import { setRef } from '@react-devui/hooks/useForkRef';
import { getClassName } from '@react-devui/utils';

const CONFIG: {
  key?: string;
  securityJsCode?: string | null;
  version?: string;
} = {
  version: '2.0',
};

export interface AppAMapProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  aKey?: string;
  aSecurityJsCode?: string | null;
  aVersion?: string;
  aPlugins?: string[];
  aOptions?: AMap.MapOptions;
}

function AMap(props: AppAMapProps, ref: React.ForwardedRef<AMap.Map>): JSX.Element | null {
  const {
    aKey = CONFIG.key,
    aSecurityJsCode = CONFIG.securityJsCode,
    aVersion = CONFIG.version,
    aPlugins,
    aOptions,

    ...restProps
  } = props;

  //#region Ref
  const elRef = useRef<HTMLDivElement>(null);
  //#endregion

  const instanceRef = useRef<AMap.Map | null>(null);
  const containerRef = useCallback(
    (el: HTMLElement | null) => {
      instanceRef.current?.destroy();
      instanceRef.current = null;
      setRef(ref, instanceRef.current);

      if (el) {
        if (isUndefined(aKey) || isUndefined(aSecurityJsCode) || isUndefined(aVersion)) {
          throw new Error('Configs of amap is required!');
        }

        if (!isNull(aSecurityJsCode)) {
          window['_AMapSecurityConfig'] = {
            // serviceHost: 'http://1.1.1.1:80/_AMapService',

            securityJsCode: aSecurityJsCode,
          };
        }

        AMapLoader.load({
          key: aKey,
          version: aVersion,
          plugins: aPlugins,
        })
          .then((AMap) => {
            instanceRef.current = new AMap.Map(el, aOptions);
            setRef(ref, instanceRef.current);
          })
          .catch((e) => {
            console.error(e);
          });
      }
    },
    [aKey, aOptions, aPlugins, aSecurityJsCode, aVersion, ref]
  );

  return (
    <div {...restProps} ref={elRef} className={getClassName(restProps.className, 'app-amap')}>
      <div ref={containerRef} className="app-amap__container"></div>
    </div>
  );
}

export const AppAMap = React.forwardRef(AMap);
