import { isString, isUndefined } from 'lodash';
import { useContext, useEffect, useRef } from 'react';

import { CloseOutlined } from '@react-devui/icons';
import { DButton } from '@react-devui/ui';

import { AMAP_V1, AppMapContext } from './Map';

export interface AppMapInfoWindowProps {
  children: React.ReactNode;
  aVisible: boolean;
  aPosition?: AMap.Vector2;
  aOptions?: AMap.InfoOptions;
  aHeader?:
    | {
        title: React.ReactNode;
        closable?: boolean;
      }
    | string;
  onUpdate?: (infoWindow: AMap.InfoWindow) => void;
  onClose?: () => void;
}

export function AppMapInfoWindow(props: AppMapInfoWindowProps): JSX.Element | null {
  const { children, aVisible, aPosition, aOptions, aHeader, onUpdate, onClose } = props;

  //#region Context
  const map = useContext(AppMapContext);
  //#endregion

  //#region Ref
  const elRef = useRef<HTMLDivElement>(null);
  //#endregion

  const header = aHeader ? (isString(aHeader) ? { title: aHeader } : aHeader) : undefined;

  useEffect(() => {
    if (elRef.current && map && aVisible) {
      const div = document.createElement('div');
      div.innerHTML = elRef.current.outerHTML;

      const content = div.firstElementChild as HTMLElement;
      const closeButton = content.querySelector('.app-map__info-window-close');
      if (closeButton) {
        (closeButton as HTMLButtonElement).onclick = () => {
          onClose?.();
        };
      }

      elRef.current.onclick = () => {
        map?.clearInfoWindow();
      };
      const infoWindow = new AMap.InfoWindow({
        ...aOptions,
        isCustom: true,
        autoMove: aOptions?.autoMove ?? false,
        content,
        offset: aOptions?.offset ?? new AMap.Pixel(0, AMAP_V1 ? -20 : -28),
      });
      onUpdate?.(infoWindow);

      if (isUndefined(aPosition)) {
        throw new Error('`aPosition` is required when `aVisible` is `true`!');
      }
      infoWindow.open(map, aPosition);

      return () => {
        map.clearInfoWindow();
      };
    }
  });

  return (
    <div style={{ display: 'none' }}>
      <div ref={elRef} className="app-map__info-window">
        {header && (
          <div className="app-map__info-window-header">
            <div className="app-map__info-window-title">{header.title}</div>
            {(header.closable ?? true) && <DButton className="app-map__info-window-close" dType="text" dIcon={<CloseOutlined />}></DButton>}
          </div>
        )}
        <div className="app-map__info-window-body">{children}</div>
      </div>
    </div>
  );
}
