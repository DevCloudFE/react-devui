import type { AppTheme } from '../../App';

import { isUndefined } from 'lodash';
import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Subject } from 'rxjs';

import { useStorage } from '@react-devui/hooks';
import { getClassName } from '@react-devui/utils';

import { STORAGE_KEY } from '../../config/storage';
import { AppMapInfoWindow } from './MapInfoWindow';
import { AppMapMarker } from './MapMarker';
import { AppMapMarkerCluster } from './MapMarkerCluster';
import { AppMapMarkerIcon } from './MapMarkerIcon';

export const AMAP_CONFIG: {
  key: string;
  securityJsCode?: string;
  version: string;
  plugins: string[];
} = {
  key: '79ea1ce8698ab569ee1727d68d7c1d88',
  securityJsCode: 'ba1e897c8871f8fa0f9e657657bb48f6',
  version: '2.0',
  plugins: [],
};

export const AMAP_V1 = AMAP_CONFIG.version.startsWith('1');
export const AMAP_V2 = AMAP_CONFIG.version.startsWith('2');

export const AppMapContext = React.createContext<AMap.Map | null>(null);

export interface AppMapProps extends React.HTMLAttributes<HTMLDivElement> {
  aPlugins?: string[];
  aOptions?: AMap.MapOptions;
}

function Map(props: AppMapProps, ref: React.ForwardedRef<AMap.Map>): JSX.Element | null {
  const {
    children,
    aPlugins = [],
    aOptions,

    ...restProps
  } = props;

  //#region Ref
  const elRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  //#endregion

  const themeStorage = useStorage<AppTheme>(...STORAGE_KEY.theme);
  const mapStyle =
    aOptions?.mapStyle ?? (themeStorage.value === 'light' ? 'amap://styles/normal' : 'amap://styles/55ef97d59ae859c69092beae5c058926');

  const [map, setMap] = useState<AMap.Map | null>(null);

  useEffect(() => {
    const url = `https://webapi.amap.com/maps?v=${AMAP_CONFIG.version}&key=${
      AMAP_CONFIG.key
    }&plugin=${AMAP_CONFIG.plugins.join()}&callback=onAMapLoaded`;

    const subject = new Subject<void>();
    let map: AMap.Map | null = null;
    subject.subscribe({
      next: () => {
        map = containerRef.current
          ? new AMap.Map(containerRef.current, {
              ...aOptions,
              mapStyle,
            })
          : null;
        setMap(map);
      },
    });

    const handleLoaded = () => {
      AMap.plugin(aPlugins, () => {
        subject.next();
        subject.complete();
      });
    };

    if (document.querySelector(`script[src="${url}"]`)) {
      if (isUndefined(window['AMap'])) {
        window['onAMapLoaded'] = () => {
          handleLoaded();
        };
      } else {
        handleLoaded();
      }
    } else {
      if (AMAP_CONFIG.securityJsCode) {
        window['_AMapSecurityConfig'] = {
          // serviceHost: 'http://1.1.1.1:80/_AMapService',

          securityJsCode: AMAP_CONFIG.securityJsCode,
        };
      }

      window['onAMapLoaded'] = () => {
        handleLoaded();
      };
      const jsapi = document.createElement('script');
      jsapi.src = url;
      document.head.appendChild(jsapi);
    }

    return () => {
      subject.complete();
      map?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (map) {
      map.setMapStyle(mapStyle);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapStyle]);

  useImperativeHandle<AMap.Map | null, AMap.Map | null>(ref, () => map, [map]);

  return (
    <AppMapContext.Provider value={map}>
      <div {...restProps} ref={elRef} className={getClassName(restProps.className, 'app-map')}>
        <div ref={containerRef} className="app-map__container"></div>
        {children}
      </div>
    </AppMapContext.Provider>
  );
}

export const AppMap: {
  (props: AppMapProps & React.RefAttributes<AMap.Map | null>): ReturnType<typeof Map>;
  Marker: typeof AppMapMarker;
  MarkerIcon: typeof AppMapMarkerIcon;
  MarkerCluster: typeof AppMapMarkerCluster;
  InfoWindow: typeof AppMapInfoWindow;
} = React.forwardRef(Map) as any;

AppMap.Marker = AppMapMarker;
AppMap.MarkerIcon = AppMapMarkerIcon;
AppMap.MarkerCluster = AppMapMarkerCluster;
AppMap.InfoWindow = AppMapInfoWindow;
