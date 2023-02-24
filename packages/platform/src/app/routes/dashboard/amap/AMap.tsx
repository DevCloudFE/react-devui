import { useState } from 'react';

import { useImmer } from '@react-devui/hooks';
import { DRadio } from '@react-devui/ui';

import { AppMap } from '../../../components';
import { AppRoute } from '../../../utils';
import styles from './AMap.module.scss';
import points from './points';

export default AppRoute(() => {
  const [mapTmp, setMapTmp] = useState('Marker');
  const [infoWindow, setInfoWindow] = useImmer<{ visible: boolean; position?: [number, number] }>({ visible: false });

  return (
    <div className={styles['app-amap']}>
      <DRadio.Group
        className="mb-3"
        dList={['Marker', 'MarkerCluster', 'InfoWindow'].map((tmp) => ({
          label: tmp,
          value: tmp,
        }))}
        dModel={mapTmp}
        dType="fill"
        onModelChange={setMapTmp}
      />
      <AppMap
        style={{ paddingTop: '61.8%' }}
        aOptions={{
          center: [104.937478, 35.439575],
          zoom: 5,
        }}
      >
        {mapTmp === 'Marker' ? (
          <AppMap.Marker aOptions={{ position: [116.406315, 39.908775] }}></AppMap.Marker>
        ) : mapTmp === 'MarkerCluster' ? (
          <AppMap.MarkerCluster aList={points as { lnglat: [number, number] }[]} />
        ) : (
          <>
            <AppMap.Marker
              aOptions={{ position: [116.406315, 39.908775] }}
              aLabel="Click me!"
              onUpdate={(marker) => {
                marker.on('click', () => {
                  setInfoWindow((draft) => {
                    draft.visible = !draft.visible;
                    draft.position = marker.getPosition() as any;
                  });
                });
              }}
            ></AppMap.Marker>
            <AppMap.InfoWindow
              aVisible={infoWindow.visible}
              aPosition={infoWindow.position}
              aHeader="Title"
              onClose={() => {
                setInfoWindow((draft) => {
                  draft.visible = false;
                });
              }}
            >
              InfoWindow
            </AppMap.InfoWindow>
          </>
        )}
      </AppMap>
    </div>
  );
});
