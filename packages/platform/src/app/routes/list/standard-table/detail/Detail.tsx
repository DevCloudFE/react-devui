import type { DeviceDoc } from '../../../../hooks/api/types';
import type { DSelectItem } from '@react-devui/ui/components/select';

import { isUndefined } from 'lodash';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { useImmer, useMount } from '@react-devui/hooks';
import { EditOutlined } from '@react-devui/icons';
import { DButton, DCard, DSeparator, DSpinner, DTable } from '@react-devui/ui';

import { AppRouteHeader } from '../../../../components';
import { useAPI } from '../../../../hooks';
import { AppDeviceModal } from '../DeviceModal';
import styles from './Detail.module.scss';

export default function Detail(): JSX.Element | null {
  const { t } = useTranslation();

  const modelApi = useAPI('/device/model');
  const deviceApi = useAPI('/device');

  const { id: _id } = useParams();
  const id = Number(_id!);

  const [device, setDevice] = useState<DeviceDoc>();
  const [paramsOfEditModal, setParamsOfEditModal] = useImmer<{
    visible: boolean;
  }>();

  const [modelList, setModelList] = useState<DSelectItem<string>[]>();

  useMount(() => {
    modelApi.list().subscribe({
      next: (res) => {
        setModelList(
          res.resources.map((model) => ({
            label: model.name,
            value: model.name,
            disabled: model.disabled,
          }))
        );
      },
    });
    deviceApi.get(id).subscribe({
      next: (device) => {
        setDevice(device);
      },
    });
  });

  return (
    <>
      <AppDeviceModal
        aVisible={paramsOfEditModal?.visible}
        aDevice={device}
        aModelList={modelList}
        onClose={() => {
          setParamsOfEditModal((draft) => {
            if (draft) {
              draft.visible = false;
            }
          });
        }}
        onSubmit={() => {
          setParamsOfEditModal((draft) => {
            if (draft) {
              draft.visible = false;
            }
          });
        }}
      />
      <AppRouteHeader>
        <AppRouteHeader.Breadcrumb
          aList={[
            { id: '/list', title: t('List', { ns: 'title' }) },
            {
              id: '/list/standard-table',
              title: t('Standard Table', { ns: 'title' }),
              link: true,
            },
            { id: '/list/standard-table/:id', title: t('Device Detail', { ns: 'title' }) },
          ]}
        />
        <AppRouteHeader.Header
          aBack
          aActions={[
            <DButton
              disabled={isUndefined(device)}
              onClick={() => {
                setParamsOfEditModal({ visible: true });
              }}
              dIcon={<EditOutlined />}
            >
              Edit
            </DButton>,
          ]}
        />
      </AppRouteHeader>
      <div className={styles['app-detail']}>
        {isUndefined(device) ? (
          <div className="d-flex justify-content-center">
            <DSpinner dVisible dAlone></DSpinner>
          </div>
        ) : (
          <>
            <DCard>
              <DCard.Content>
                <div className="app-title mb-3">Title 1</div>
                <div className="row g-3">
                  {Array.from({ length: 5 }).map((_, n) => (
                    <div key={n} className="col-12 col-md-6 col-lg-4">
                      <span className="app-label">Label {n}</span>
                      <span>Content {n}</span>
                    </div>
                  ))}
                </div>
                <DSeparator />
                <div className="app-title mb-3">Title 2</div>
                <div className="row g-3">
                  {Array.from({ length: 5 }).map((_, n) => (
                    <div key={n} className="col-12 col-md-6 col-lg-4">
                      <span className="app-label">Label {n}</span>
                      <span>Content {n}</span>
                    </div>
                  ))}
                </div>
              </DCard.Content>
            </DCard>
            <DCard className="mt-3">
              <DCard.Header>Title</DCard.Header>
              <DCard.Content>
                <DTable style={{ overflow: 'auto hidden' }}>
                  <table style={{ minWidth: 600 }}>
                    <thead>
                      <tr>
                        {Array.from({ length: 4 }).map((_, n) => (
                          <DTable.Th key={n}>Name {n}</DTable.Th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: 3 }).map((_, n1) => (
                        <tr key={n1}>
                          {Array.from({ length: 4 }).map((_, n2) => (
                            <DTable.Td key={n2}>Content {n2}</DTable.Td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </DTable>
              </DCard.Content>
            </DCard>
          </>
        )}
      </div>
    </>
  );
}
