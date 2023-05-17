import type { DeviceDoc, StandardQueryParams } from '../../../utils/types';
import type { DSelectItem } from '@react-devui/ui/components/select';

import { isUndefined } from 'lodash';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useImmer, useMount } from '@react-devui/hooks';
import { DownOutlined, PlusOutlined } from '@react-devui/icons';
import { DButton, DCard, DCheckbox, DDropdown, DModal, DPagination, DSelect, DSpinner } from '@react-devui/ui';

import { AppRouteHeader, AppStatusDot, AppTable, AppTableFilter } from '../../../components';
import { useHttp } from '../../../core';
import { useAPI, useQueryParams } from '../../../hooks';
import { AppRoute, DialogService } from '../../../utils';
import { AppDeviceModal } from './DeviceModal';

import styles from './StandardTable.module.scss';

export type DeviceData = DeviceDoc;

interface DeviceQueryParams {
  keyword: string;
  sort: 'id' | '-id' | null;
  model: string[];
  status: number[];
  page: number;
  pageSize: number;
}

export default AppRoute(() => {
  const { t } = useTranslation();
  const http = useHttp();
  const modelApi = useAPI(http, '/device/model');
  const deviceApi = useAPI(http, '/device');

  const [deviceQuerySaved, setDeviceQuerySaved] = useQueryParams<DeviceQueryParams>({
    keyword: '',
    sort: '-id',
    model: [],
    status: [],
    page: 1,
    pageSize: 10,
  });
  const [deviceQuery, setDeviceQuery] = useImmer(deviceQuerySaved);
  const queryEmptyStatus = (() => {
    const getEmptyStatus = (query: DeviceQueryParams) => ({
      keyword: query.keyword.length === 0,
      model: query.model.length === 0,
      status: query.status.length === 0,
    });
    return {
      deviceQuerySaved: getEmptyStatus(deviceQuerySaved),
      deviceQuery: getEmptyStatus(deviceQuery),
    };
  })();

  const [deviceTable, setDeviceTable] = useImmer({
    loading: true,
    list: [] as DeviceData[],
    totalSize: 0,
    selected: new Set<number>(),
  });
  const allDeviceSelected =
    deviceTable.selected.size === 0 ? false : deviceTable.selected.size === deviceTable.list.length ? true : 'mixed';

  const [paramsOfDeleteModal, setParamsOfDeleteModal] = useImmer<{
    visible: boolean;
    device: DeviceData;
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
  });

  const [updateDeviceTable, setUpdateDeviceTable] = useState(0);
  useEffect(() => {
    if (updateDeviceTable !== 0) {
      setDeviceQuerySaved(deviceQuery);
      setDeviceTable((draft) => {
        draft.loading = true;
      });
    }

    const apiQuery: StandardQueryParams = {
      page: deviceQuery.page,
      page_size: deviceQuery.pageSize,
    };
    if (deviceQuery.sort) {
      apiQuery.sort = deviceQuery.sort;
    }
    deviceApi.list<DeviceData>(apiQuery).subscribe({
      next: (res) => {
        setDeviceQuery((draft) => {
          draft.page = res.metadata.page;
          draft.pageSize = res.metadata.page_size;
        });
        setDeviceTable((draft) => {
          draft.loading = false;
          draft.list = res.resources;
          draft.totalSize = res.metadata.total_size;
        });
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateDeviceTable]);

  const openDeviceModal = (device?: DeviceData) => {
    DialogService.open(AppDeviceModal, {
      aDevice: device,
      onSuccess: () => {
        setUpdateDeviceTable((n) => n + 1);
      },
    });
  };

  return (
    <>
      {paramsOfDeleteModal && (
        <DModal
          dVisible={paramsOfDeleteModal.visible}
          dFooter={
            <DModal.Footer
              onOkClick={() =>
                new Promise((r) => {
                  modelApi.list().subscribe({
                    next: () => {
                      r(true);
                    },
                  });
                })
              }
            />
          }
          dType={{
            type: 'warning',
            title: 'Delete device',
            description: (
              <>
                Confirm to delete <strong>{paramsOfDeleteModal.device.name}</strong>?
              </>
            ),
          }}
          dMaskClosable={false}
          dSkipFirstTransition={false}
          onClose={() => {
            setParamsOfDeleteModal((draft) => {
              if (draft) {
                draft.visible = false;
              }
            });
          }}
        />
      )}
      <AppRouteHeader>
        <AppRouteHeader.Breadcrumb
          aList={[
            { id: '/list', title: t('List', { ns: 'title' }) },
            { id: '/list/standard-table', title: t('Standard Table', { ns: 'title' }) },
          ]}
        />
        <AppRouteHeader.Header
          aActions={[
            <DButton
              onClick={() => {
                openDeviceModal();
              }}
              dIcon={<PlusOutlined />}
            >
              Add
            </DButton>,
          ]}
        />
      </AppRouteHeader>
      <div className={styles['app-standard-table']}>
        <DCard>
          <DCard.Content>
            <DSpinner dVisible={deviceTable.loading}></DSpinner>
            <AppTableFilter
              className="mb-3"
              aFilterList={[
                {
                  label: 'Model',
                  node: (
                    <DSelect
                      style={{ width: '16em' }}
                      dModel={deviceQuery.model}
                      dList={modelList ?? []}
                      dLoading={isUndefined(modelList)}
                      dPlaceholder="Model"
                      dMultiple
                      dClearable
                      onModelChange={(value) => {
                        setDeviceQuery((draft) => {
                          draft.model = value;
                        });
                      }}
                    />
                  ),
                  isEmpty: queryEmptyStatus.deviceQuery.model,
                },
                {
                  label: 'Status',
                  node: (
                    <DCheckbox.Group
                      dList={[0, 1, 2].map((n) => ({
                        label: n === 0 ? 'Normal' : n === 1 ? 'Failure' : 'Alarm',
                        value: n,
                      }))}
                      dModel={deviceQuery.status}
                      onModelChange={(value) => {
                        setDeviceQuery((draft) => {
                          draft.status = value;
                        });
                      }}
                    />
                  ),
                  isEmpty: queryEmptyStatus.deviceQuery.status,
                },
              ]}
              aLabelWidth={72}
              aSearchValue={deviceQuery.keyword}
              aSearchPlaceholder="ID, Name"
              onSearchValueChange={(value) => {
                setDeviceQuery((draft) => {
                  draft.keyword = value;
                });
              }}
              onSearchClick={() => {
                setDeviceQuery((draft) => {
                  draft.page = 1;
                });
                setUpdateDeviceTable((n) => n + 1);
              }}
              onResetClick={() => {
                setDeviceQuery((draft) => {
                  draft.keyword = '';
                  draft.model = [];
                  draft.status = [];
                });

                if (Object.values(queryEmptyStatus.deviceQuerySaved).some((isEmpty) => !isEmpty)) {
                  setUpdateDeviceTable((n) => n + 1);
                }
              }}
            />
            <AppTable
              aData={deviceTable.list}
              aColumns={[
                {
                  th: (
                    <DCheckbox
                      dModel={allDeviceSelected !== 'mixed' ? allDeviceSelected : undefined}
                      dIndeterminate={allDeviceSelected === 'mixed'}
                      onModelChange={(checked) => {
                        setDeviceTable((draft) => {
                          draft.selected = new Set(checked ? draft.list.map((data) => data.id) : []);
                        });
                      }}
                    ></DCheckbox>
                  ),
                  td: (data) => (
                    <DCheckbox
                      dModel={deviceTable.selected.has(data.id)}
                      onModelChange={(checked) => {
                        setDeviceTable((draft) => {
                          if (checked) {
                            draft.selected.add(data.id);
                          } else {
                            draft.selected.delete(data.id);
                          }
                        });
                      }}
                    ></DCheckbox>
                  ),
                  width: 60,
                  align: 'center',
                  checkbox: true,
                },
                {
                  th: 'NAME',
                  td: 'name',
                  title: true,
                },
                {
                  th: 'MODEL',
                  td: 'model',
                },
                {
                  th: 'PRICE',
                  td: 'price',
                },
                {
                  th: 'STATUS',
                  td: (data) => (
                    <AppStatusDot
                      aTheme={data.status === 0 ? 'success' : data.status === 1 ? 'warning' : 'danger'}
                      aWave={data.status === 2}
                    >
                      {data.status === 0 ? 'Normal' : data.status === 1 ? 'Failure' : 'Alarm'}
                    </AppStatusDot>
                  ),
                  nowrap: true,
                },
                {
                  th: 'CREATE TIME',
                  td: (data) => new Date(data.create_time).toLocaleString(),
                },
              ]}
              aActions={{
                actions: (data) => [
                  { text: 'View', link: `/list/standard-table/${data.id}` },
                  {
                    text: 'Edit',
                    onclick: () => {
                      openDeviceModal(data);
                    },
                  },
                  {
                    text: 'Delete',
                    onclick: () => {
                      setParamsOfDeleteModal({ visible: true, device: data });
                    },
                  },
                ],
                width: 140,
              }}
              aScroll={{ x: 1200 }}
              aLabelWidth={72}
            />
            <div className="app-table-footer">
              <div>
                <DButton className="me-2" disabled={allDeviceSelected === false} dType="secondary">
                  Download
                </DButton>
                <DDropdown
                  dList={[
                    { id: 1, label: 'Action 1', type: 'item' },
                    { id: 2, label: 'Action 2', type: 'item' },
                  ]}
                  dPlacement="bottom-right"
                >
                  <DButton disabled={allDeviceSelected === false} dType="secondary" dIcon={<DownOutlined />} dIconRight>
                    More
                  </DButton>
                </DDropdown>
              </div>
              <DPagination
                dActive={deviceQuery.page}
                dPageSize={deviceQuery.pageSize}
                dTotal={deviceTable.totalSize}
                dCompose={['total', 'pages', 'page-size', 'jump']}
                onPaginationChange={(page, pageSize) => {
                  setDeviceQuery((draft) => {
                    draft.page = page;
                    draft.pageSize = pageSize;
                  });
                  setUpdateDeviceTable((n) => n + 1);
                }}
              ></DPagination>
            </div>
          </DCard.Content>
        </DCard>
      </div>
    </>
  );
});
