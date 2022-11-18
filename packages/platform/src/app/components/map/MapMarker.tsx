import { isArray, isUndefined } from 'lodash';
import React, { useContext, useEffect, useRef } from 'react';

import { checkNodeExist } from '@react-devui/utils';

import { AMAP_V1, AppMapContext } from './Map';
import { AppMapMarkerIcon } from './MapMarkerIcon';

export interface AppMapMarkerProps {
  aOptions: AMap.MarkerOptions;
  aContent?: React.ReactNode;
  aLabel?: React.ReactNode;
  onUpdate?: (marker: AMap.Marker) => void;
}

export function AppMapMarker(props: AppMapMarkerProps): JSX.Element | null {
  const { aOptions, aContent, aLabel, onUpdate } = props;

  //#region Context
  const map = useContext(AppMapContext);
  //#endregion

  //#region Ref
  const elRef = useRef<HTMLDivElement>(null);
  //#endregion

  useEffect(() => {
    if (elRef.current && map) {
      const marker = new AMap.Marker(
        Object.assign(
          {
            ...aOptions,
            content: elRef.current.outerHTML,
            offset: isUndefined(aOptions.offset)
              ? (() => {
                  const div = document.createElement('div');
                  div.innerHTML = elRef.current.outerHTML;
                  div.style.cssText = 'position:fixed;top:-200vh;left:-200vw;';
                  document.body.appendChild(div);
                  const width = (div.firstElementChild as HTMLElement).offsetWidth;
                  const height = (div.firstElementChild as HTMLElement).offsetHeight;
                  document.body.removeChild(div);

                  return new AMap.Pixel(-(width / 2), -height);
                })()
              : isArray(aOptions.offset)
              ? new AMap.Pixel(...aOptions.offset)
              : aOptions.offset,
          },
          AMAP_V1
            ? {
                resizeEnable: aOptions['reresizeEnable'] ?? true,
              }
            : {}
        )
      );
      onUpdate?.(marker);
      map.add(marker);

      return () => {
        map.remove(marker);
      };
    }
  });

  return (
    <div style={{ display: 'none' }}>
      <div ref={elRef} className="app-map__marker">
        {isUndefined(aContent) ? <AppMapMarkerIcon /> : aContent}
        {checkNodeExist(aLabel) && <div className="app-map__marker-label">{aLabel}</div>}
      </div>
    </div>
  );
}
