import type { DeviceDoc } from '../../../hooks/api/types';
import type { DSelectItem } from '@react-devui/ui/components/select';

import { isUndefined } from 'lodash';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { useAsync, useImmer, useMount } from '@react-devui/hooks';
import { DownOutlined, PlusOutlined } from '@react-devui/icons';
import {
  DButton,
  DCard,
  DCheckbox,
  DDropdown,
  DModal,
  DPagination,
  DSelect,
  DSeparator,
  DSpinner,
  DTable,
  FormControl,
  FormGroup,
  useForm,
  Validators,
} from '@react-devui/ui';

import { AppRouteHeader, AppStatusDot, AppTableFilter } from '../../../components';
import { useAPI, useQueryParams } from '../../../hooks';
import { AppDeviceModal } from './DeviceModal';
import styles from './StandardTable.module.scss';

interface DeviceQueryParams {
  keyword: string;
  sort: 'id' | '-id' | null;
  model: string[];
  status: number[];
  page: number;
  pageSize: number;
}

export default function StandardTable(): JSX.Element | null {
  const { t } = useTranslation();
  const async = useAsync();
  const modelApi = useAPI('/device/model');
  const deviceApi = useAPI('/device');
  const [initDeviceQuery, saveDeviceQuery] = useQueryParams<DeviceQueryParams>({
    keyword: '',
    sort: '-id',
    model: [],
    status: [],
    page: 1,
    pageSize: 10,
  });
  const [deviceQuery, setDeviceQuery] = useImmer(initDeviceQuery);
  const [deviceTable, setDeviceTable] = useImmer({
    loading: true,
    list: [] as DeviceDoc[],
    totalSize: 0,
    selected: new Set<number>(),
  });
  const allDeviceSelected =
    deviceTable.selected.size === 0 ? false : deviceTable.selected.size === deviceTable.list.length ? true : 'mixed';

  const [modelList, setModelList] = useState<DSelectItem<string>[]>();

  const [paramsOfDeleteModal, setParamsOfDeleteModal] = useImmer<{
    visible: boolean;
    device: DeviceDoc;
  }>();

  const [paramsOfDeviceModal, setParamsOfDeviceModal] = useImmer<{
    visible: boolean;
    device: DeviceDoc | undefined;
  }>();
  const [deviceForm, updateDeviceForm] = useForm(
    () =>
      new FormGroup({
        name: new FormControl('', Validators.required),
        model: new FormControl<string | null>(null, Validators.required),
      })
  );
  const openDeviceModal = (device?: DeviceDoc) => {
    setParamsOfDeviceModal({ visible: true, device });
    deviceForm.reset(device ? { name: device.name, model: device.model } : undefined);
    updateDeviceForm();
  };

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
    saveDeviceQuery(deviceQuery);

    const apiQuery: any = {
      page: deviceQuery.page,
      page_size: deviceQuery.pageSize,
    };
    if (deviceQuery.sort) {
      apiQuery.sort = deviceQuery.sort;
    }

    setDeviceTable((draft) => {
      draft.loading = true;
    });
    deviceApi.list<DeviceDoc>(apiQuery).subscribe({
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

  return (
    <>
      {paramsOfDeleteModal && (
        <DModal
          dVisible={paramsOfDeleteModal.visible}
          dFooter={
            <DModal.Footer
              onOkClick={() =>
                new Promise((r) => {
                  async.setTimeout(() => {
                    r(true);
                  }, 500);
                })
              }
            />
          }
          dType={{
            type: 'warning',
            title: 'Delete device',
            description: `Confirm to delete ${paramsOfDeleteModal.device.name}?`,
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
      {paramsOfDeviceModal && (
        <AppDeviceModal
          aVisible={paramsOfDeviceModal.visible}
          aHeader={`${paramsOfDeviceModal.device ? 'Edit' : 'Add'} Device`}
          aForm={deviceForm}
          aUpdateForm={updateDeviceForm}
          aModelList={modelList}
          onClose={() => {
            setParamsOfDeviceModal((draft) => {
              if (draft) {
                draft.visible = false;
              }
            });
          }}
          onSubmit={() =>
            new Promise((r) => {
              async.setTimeout(() => {
                r(true);
              }, 500);
            })
          }
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
                      dList={modelList ?? []}
                      dLoading={isUndefined(modelList)}
                      dPlaceholder="Model"
                      dModel={deviceQuery.model}
                      dMultiple
                      dClearable
                      onModelChange={(value) => {
                        setDeviceQuery((draft) => {
                          draft.model = value;
                        });
                      }}
                    />
                  ),
                  isEmpty: deviceQuery.model.length === 0,
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
                  isEmpty: deviceQuery.status.length === 0,
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
                setUpdateDeviceTable((n) => n + 1);
              }}
              onResetClick={() => {
                setDeviceQuery((draft) => {
                  draft.keyword = '';
                  draft.model = [];
                  draft.status = [];
                });
              }}
            />
            <DTable style={{ overflow: 'auto hidden' }}>
              <table style={{ minWidth: 1200 }}>
                <thead>
                  <tr>
                    <DTable.Th dWidth={60} dAlign="center">
                      <DCheckbox
                        dModel={allDeviceSelected !== 'mixed' ? allDeviceSelected : undefined}
                        dIndeterminate={allDeviceSelected === 'mixed'}
                        onModelChange={(checked) => {
                          setDeviceTable((draft) => {
                            draft.selected = new Set(checked ? draft.list.map((data) => data.id) : []);
                          });
                        }}
                      ></DCheckbox>
                    </DTable.Th>
                    <DTable.Th
                      dSort={{
                        options: ['ascend', 'descend'],
                        active: deviceQuery.sort === 'id' ? 'ascend' : deviceQuery.sort === '-id' ? 'descend' : null,
                        onSort: (order) => {
                          setDeviceQuery((draft) => {
                            draft.sort = order === 'ascend' ? 'id' : order === 'descend' ? '-id' : null;
                          });
                          setUpdateDeviceTable((n) => n + 1);
                        },
                      }}
                    >
                      ID
                    </DTable.Th>
                    <DTable.Th>NAME</DTable.Th>
                    <DTable.Th>MODEL</DTable.Th>
                    <DTable.Th>PRICE</DTable.Th>
                    <DTable.Th>STATUS</DTable.Th>
                    <DTable.Th>CREATE TIME</DTable.Th>
                    <DTable.Th dWidth={140} dFixed={{ top: 0, right: 0 }}>
                      ACTIONS
                    </DTable.Th>
                  </tr>
                </thead>
                <tbody>
                  {deviceTable.list.length === 0 ? (
                    <DTable.Empty />
                  ) : (
                    deviceTable.list.map((data) => (
                      <tr key={data.id}>
                        <DTable.Td dWidth={60} dAlign="center">
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
                        </DTable.Td>
                        <DTable.Td>{data.id}</DTable.Td>
                        <DTable.Td>{data.name}</DTable.Td>
                        <DTable.Td>{data.model}</DTable.Td>
                        <DTable.Td>{data.price}</DTable.Td>
                        <DTable.Td dNowrap>
                          <AppStatusDot aTheme={data.status === 0 ? 'success' : data.status === 1 ? 'warning' : 'danger'}>
                            {data.status === 0 ? 'Normal' : data.status === 1 ? 'Failure' : 'Alarm'}
                          </AppStatusDot>
                        </DTable.Td>
                        <DTable.Td>{new Date(data.create_time).toLocaleString()}</DTable.Td>
                        <DTable.Td dWidth={140} dFixed={{ right: 0 }} dNowrap>
                          <Link className="app-link" to={`/list/standard-table/${data.id}`}>
                            View
                          </Link>
                          <DSeparator dVertical></DSeparator>
                          <DDropdown
                            dList={[
                              { id: 'edit', label: 'Edit', type: 'item' },
                              { id: 'delete', label: 'Delete', type: 'item' },
                            ]}
                            dPlacement="bottom-right"
                            onItemClick={(action) => {
                              switch (action) {
                                case 'edit':
                                  openDeviceModal(data);
                                  break;

                                case 'delete':
                                  setParamsOfDeleteModal({ visible: true, device: data });
                                  break;

                                default:
                                  break;
                              }
                            }}
                          >
                            <DButton dType="link">More</DButton>
                          </DDropdown>
                        </DTable.Td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </DTable>
            <div className="mt-3 d-flex align-items-center justify-content-between flex-wrap" style={{ gap: '10px 12px' }}>
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
}
