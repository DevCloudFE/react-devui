import { isUndefined } from 'lodash';
import { useContext, useEffect, useRef } from 'react';
import { Subject } from 'rxjs';

import { AMAP_V1, AppMapContext } from './Map';
import { AppMapMarkerIcon } from './MapMarkerIcon';

export interface MarkerClusterOptions {
  gridSize?: number;
  maxZoom?: number;
  averageCenter?: boolean;
  clusterByZoomChange?: boolean;
  styles?: {
    url: string;
    size: AMap.Size;
    offset?: AMap.Pixel;
    imageOffset?: AMap.Pixel;
    textColor?: string;
    textSize?: number;
  }[];
  renderClusterMarker?: (context: { count: number; marker: AMap.Marker }) => void;
  renderMarker?: (context: { marker: AMap.Marker }) => void;
}
export interface MarkerClusterDataOption {
  lnglat: [number, number];
  weight?: number;
  // Only for v1.x
  extData?: any;
}
export interface MarkerCluster {
  addData: (dataOptions: MarkerClusterDataOption[]) => void;
  setData: (dataOptions: MarkerClusterDataOption[]) => void;
  getClustersCount: () => number;
  getGridSize: () => number;
  setGridSize: (size: number) => void;
  getMaxZoom: () => number;
  setMaxZoom: (zoom: number) => void;
  getStyles: () => MarkerClusterOptions['styles'];
  setStyles: (styles: MarkerClusterOptions['styles']) => void;
  getMap: () => AMap.Map;
  setMap: (map: AMap.Map | null) => void;
  isAverageCenter: () => boolean;
  setAverageCenter: (averageCenter: boolean) => void;
  on: (type: string | string[], fn: (e: any) => void, context?: any, once?: boolean) => this;
}

export interface AppMapMarkerClusterProps<T extends MarkerClusterDataOption> {
  aList: T[];
  aOptions?: MarkerClusterOptions;
  aColor?: {
    clusterMarker?: (context: any) => string;
    marker?: (context: any) => string;
  };
  onUpdate?: (cluster: MarkerCluster) => void;
}

export function AppMapMarkerCluster<T extends MarkerClusterDataOption>(props: AppMapMarkerClusterProps<T>): JSX.Element | null {
  const { aList, aOptions, aColor, onUpdate } = props;

  //#region Context
  const map = useContext(AppMapContext);
  //#endregion

  //#region Ref
  const clusterRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<HTMLDivElement>(null);
  //#endregion

  useEffect(() => {
    if (map) {
      let cluster: MarkerCluster | null = null;
      const subject = new Subject<void>();
      subject.subscribe({
        next: () => {
          const renderMarker = (context: { marker: AMap.Marker }) => {
            if (markerRef.current) {
              const div = document.createElement('div');
              div.innerHTML = markerRef.current.outerHTML;

              const content = div.firstElementChild as HTMLElement;
              const color = aColor?.marker?.(context);
              if (!isUndefined(color)) {
                content.style.color = color;
              }

              context.marker.setOffset(new AMap.Pixel(-12, -24));
              context.marker.setContent(content);
            }
          };
          const renderClusterMarker = (context: { marker: AMap.Marker; count: number }) => {
            const count = aList.length;
            const factor = Math.pow(context.count / count, 1 / 18);
            const size = Math.round(30 + Math.pow(context.count / count, 1 / 5) * 20);
            const Hue = 180 - factor * 180;

            if (clusterRef.current) {
              const div = document.createElement('div');
              div.innerHTML = clusterRef.current.outerHTML;

              const content = div.firstElementChild as HTMLElement;
              content.style.cssText = `width:${size}px;height:${size}px;color:hsl(${Hue}deg 100% 40% / 70%);`;
              const color = aColor?.clusterMarker?.(context);
              if (!isUndefined(color)) {
                content.style.color = color;
              }
              content.firstElementChild!.innerHTML = String(context.count);

              context.marker.setOffset(new AMap.Pixel(-size / 2, -size / 2));
              context.marker.setContent(content);
            }
          };
          if (AMAP_V1) {
            cluster = new AMap['MarkerClusterer'](
              map,
              aList.map(
                (o) =>
                  new AMap.Marker({
                    position: o.lnglat,
                    extData: o.extData,
                  })
              ),
              {
                ...aOptions,
                minClusterSize: 1,
                renderClusterMarker: (context) => {
                  if (isUndefined(aOptions?.renderClusterMarker)) {
                    if (context.count === 1) {
                      renderMarker(context);
                    } else {
                      renderClusterMarker(context);
                    }
                  } else {
                    aOptions?.renderClusterMarker(context);
                  }
                },
              } as MarkerClusterOptions
            );
            onUpdate?.(cluster as MarkerCluster);
          } else {
            cluster = new AMap['MarkerClusterer'](map, aList, {
              ...aOptions,
              renderMarker: (context) => {
                if (isUndefined(aOptions?.renderMarker)) {
                  renderMarker(context);
                } else {
                  aOptions?.renderMarker(context);
                }
              },
              renderClusterMarker: (context) => {
                if (isUndefined(aOptions?.renderClusterMarker)) {
                  renderClusterMarker(context);
                } else {
                  aOptions?.renderClusterMarker(context);
                }
              },
            } as MarkerClusterOptions);
            onUpdate?.(cluster as MarkerCluster);
          }
        },
      });

      AMap.plugin([AMAP_V1 ? 'AMap.MarkerClusterer' : 'AMap.MarkerCluster'], () => {
        subject.next();
        subject.complete();
      });

      return () => {
        subject.complete();
        cluster?.setMap(null);
      };
    }
  });

  return (
    <div style={{ display: 'none' }}>
      <div ref={markerRef} className="app-map__marker">
        <AppMapMarkerIcon />
      </div>
      <div ref={clusterRef} className="app-map__marker-cluster">
        <div className="app-map__marker-cluster-text"></div>
        <div className="app-map__marker-cluster-ripple">
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    </div>
  );
}
