import { get, isString, isUndefined } from 'lodash';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

import { useImmer } from '@react-devui/hooks';
import { CaretDownOutlined, CaretUpOutlined, DCustomIcon, EllipsisOutlined, LoadingOutlined } from '@react-devui/icons';
import { DButton, DSeparator, DTable, DDropdown, DEmpty, DCard } from '@react-devui/ui';
import { getClassName } from '@react-devui/utils';

import { AppDetailView } from '../detail-view';

export interface AppTableColumn<T> {
  th: React.ReactNode;
  thProps?: {
    sort?: {
      options?: ('ascend' | 'descend' | null)[];
      active?: 'ascend' | 'descend' | null;
      onSort?: (order: 'ascend' | 'descend' | null) => void;
    };
    actions?: React.ReactNode[];
  };
  td: ((data: T, index: number) => React.ReactNode) | string;
  width?: number | string;
  fixed?: {
    top?: number | string;
    right?: number | string;
    bottom?: number | string;
    left?: number | string;
  };
  align?: 'left' | 'right' | 'center';
  nowrap?: boolean;
  title?: boolean;
  checkbox?: boolean;
  hidden?: boolean;
}

export interface AppTableProps<T> {
  className?: string;
  aName?: string;
  aData: T[];
  aColumns: AppTableColumn<T>[];
  aActions?: {
    actions: (
      data: T,
      index: number
    ) => {
      text: string;
      onclick?: () => void | Promise<void>;
      link?: string;
      render?: (node: React.ReactElement) => React.ReactNode;
      loading?: boolean;
      hidden?: boolean;
    }[];
    width: number | string;
  };
  aExpand?: (data: T, index: number) => React.ReactNode;
  aExpandFixed?: {
    top?: number | string;
    right?: number | string;
    bottom?: number | string;
    left?: number | string;
  };
  aScroll?: { x?: number | string; y?: number | string };
  aKey?: (data: T, index: number) => any;
}

export function AppTable<T = any>(props: AppTableProps<T>): JSX.Element | null {
  const { className, aName, aData, aColumns, aActions, aExpand, aExpandFixed, aScroll, aKey = (data) => data['id'] } = props;

  const columns = aColumns.filter((column) => !column.hidden);
  const titleIndex = columns.findIndex((column) => column.title);

  const { t } = useTranslation();

  const navigate = useNavigate();

  const [expands, setExpands] = useImmer(new Set<any>());

  return (
    <>
      <DTable
        className={getClassName('d-none d-md-block', className)}
        style={{
          maxHeight: aScroll?.y,
          overflowX: isUndefined(aScroll?.x) ? 'hidden' : 'auto',
          overflowY: isUndefined(aScroll?.y) ? 'hidden' : 'auto',
        }}
      >
        <table style={{ minWidth: aScroll?.x }}>
          {aName && <caption>{aName}</caption>}
          <thead>
            <tr>
              {!isUndefined(aExpand) && <DTable.Th dWidth={60} dFixed={Object.assign({ top: 0 }, aExpandFixed)}></DTable.Th>}
              {columns.map((column, index) => (
                <DTable.Th
                  key={index}
                  dWidth={column.width}
                  dSort={column.thProps?.sort}
                  dActions={column.thProps?.actions}
                  dFixed={Object.assign({ top: 0 }, column.fixed)}
                  dAlign={column.align}
                >
                  {column.th}
                </DTable.Th>
              ))}
              {aActions && (
                <DTable.Th dWidth={aActions.width} dFixed={{ top: 0, right: 0 }}>
                  {t('components.table.ACTIONS')}
                </DTable.Th>
              )}
            </tr>
          </thead>
          <tbody>
            {aData.length === 0 ? (
              <DTable.Empty />
            ) : (
              aData.map((data, index) => {
                const id = aKey(data, index);
                const expandNode = !isUndefined(aExpand) && expands.has(id) ? aExpand(data, index) : false;

                return (
                  <React.Fragment key={id}>
                    <tr>
                      {!isUndefined(aExpand) && (
                        <DTable.Td dWidth={60} dAlign="center">
                          <DTable.Expand
                            dExpand={expands.has(id)}
                            onExpandChange={(expand) => {
                              setExpands((draft) => {
                                if (expand) {
                                  draft.add(id);
                                } else {
                                  draft.delete(id);
                                }
                              });
                            }}
                          />
                        </DTable.Td>
                      )}
                      {columns.map((column, indexOfCol) => (
                        <DTable.Td
                          key={indexOfCol}
                          dWidth={column.width}
                          dFixed={column.fixed}
                          dAlign={column.align}
                          dNowrap={column.nowrap}
                        >
                          {isString(column.td) ? get(data, column.td) : column.td(data, index)}
                        </DTable.Td>
                      ))}
                      {aActions && (
                        <DTable.Td dWidth={aActions.width} dFixed={{ top: 0, right: 0 }} dNowrap>
                          {(() => {
                            const actions = aActions.actions(data, index).filter((action) => !action.hidden);
                            const getAction = (action: typeof actions[0]) => {
                              const node = action.link ? (
                                <Link className="app-link" to={action.link}>
                                  {action.text}
                                </Link>
                              ) : (
                                <DButton disabled={action.loading} dType="link" onClick={action.onclick}>
                                  {action.loading ? <LoadingOutlined dSpin /> : action.text}
                                </DButton>
                              );
                              return action.render ? action.render(node) : node;
                            };
                            if (actions.length > 2) {
                              return (
                                <>
                                  {getAction(actions[0])}
                                  <DSeparator dVertical></DSeparator>
                                  <DDropdown
                                    dList={actions.slice(1).map((action, indexOfAction) => ({
                                      id: indexOfAction + 1,
                                      label: action.text,
                                      type: 'item',
                                    }))}
                                    dPlacement="bottom-right"
                                    onItemClick={(id) => {
                                      if (actions[id].link) {
                                        navigate(actions[id].link!);
                                      } else {
                                        return actions[id].onclick?.();
                                      }
                                    }}
                                  >
                                    <DButton dType="link">{t('components.table.More')}</DButton>
                                  </DDropdown>
                                </>
                              );
                            } else {
                              return actions.map((action, indexOfAction) => (
                                <React.Fragment key={indexOfAction}>
                                  {getAction(action)}
                                  {indexOfAction !== actions.length - 1 && <DSeparator dVertical></DSeparator>}
                                </React.Fragment>
                              ));
                            }
                          })()}
                        </DTable.Td>
                      )}
                    </tr>
                    {expandNode !== false && (
                      <tr>
                        <td colSpan={1 + columns.length + (aActions ? 1 : 0)}>{expandNode}</td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </DTable>
      <div className={getClassName('d-md-none', className)}>
        {aName && <h2 className="app-table__title">{aName}</h2>}
        {aData.length === 0 ? (
          <DEmpty
            dIcon={
              <DCustomIcon viewBox="0 0 1669 1024" dSize={[75, 48]}>
                <path
                  d="M1395.776577 634.695495L1216.807207 341.333333c-3.69009-6.457658-10.147748-10.147748-17.527928-10.147747H452.958559c-6.457658 0-13.837838 3.69009-17.527928 10.147747L256.461261 634.695495v362.551352c0 10.147748 6.457658 17.527928 17.527928 17.527928h1107.94955c10.147748 0 17.527928-6.457658 17.527928-17.527928V641.153153c-3.69009 0-3.69009-2.767568-3.69009-6.457658zM464.028829 369.009009h725.102703l162.363963 255.538739H950.198198c-10.147748 0-17.527928 6.457658-17.527928 17.527928 0 59.041441-47.971171 107.012613-107.012612 107.012612-59.041441 0-107.012613-47.971171-107.012613-107.012612 0-10.147748-6.457658-17.527928-17.527928-17.527928H301.664865L464.028829 369.009009z m897.614414 614.4h-1070.126126V662.371171h393.917117c10.147748 69.189189 69.189189 128.230631 141.145946 128.230631s134.688288-55.351351 141.145946-128.230631h393.917117v321.037838zM170.666667 814.587387V793.369369c0-3.69009-3.69009-10.147748-10.147748-10.147747-3.69009 0-10.147748 3.69009-10.147748 10.147747v20.295496h-17.527928c-3.69009 0-10.147748 3.69009-10.147748 10.147748 0 6.457658 3.69009 10.147748 10.147748 10.147747h20.295496v20.295496c0 3.69009 3.69009 10.147748 10.147747 10.147748 3.69009 0 10.147748-3.69009 10.147748-10.147748v-20.295496H193.72973c3.69009 0 10.147748-3.69009 10.147747-10.147747 0-6.457658-3.69009-10.147748-10.147747-10.147748h-23.063063z m1294.299099-393.917117h31.365766c6.457658 0 13.837838 6.457658 13.837837 13.837838 0 6.457658-6.457658 13.837838-13.837837 13.837838h-31.365766V479.711712c0 6.457658-6.457658 13.837838-13.837838 13.837838s-13.837838-6.457658-13.837838-13.837838v-31.365766h-31.365766c-6.457658 0-13.837838-6.457658-13.837838-13.837838 0-6.457658 6.457658-13.837838 13.837838-13.837838h31.365766v-31.365765c0-6.457658 6.457658-13.837838 13.837838-13.837838s13.837838 6.457658 13.837838 13.837838v31.365765z m107.012612 127.308108h17.527928c3.69009 0 10.147748 3.69009 10.147748 10.147748s-3.69009 10.147748-10.147748 10.147748h-17.527928v17.527928c0 3.69009-3.69009 10.147748-10.147747 10.147748-3.69009 0-10.147748-3.69009-10.147748-6.457658V571.963964h-17.527928c-3.69009 0-10.147748-3.69009-10.147748-10.147748s3.69009-10.147748 10.147748-10.147748h17.527928v-20.295495c0-3.69009 3.69009-10.147748 10.147748-10.147748 3.69009 0 10.147748 3.69009 10.147747 10.147748v16.605405zM194.652252 396.684685v-31.365766c0-6.457658-6.457658-13.837838-13.837838-13.837838-6.457658 0-13.837838 6.457658-13.837837 13.837838v27.675676h-31.365766c-6.457658 0-13.837838 6.457658-13.837838 13.837837 0 6.457658 6.457658 13.837838 13.837838 13.837838h27.675675v34.133334c0 6.457658 6.457658 13.837838 13.837838 13.837837 6.457658 0 13.837838-6.457658 13.837838-13.837837v-27.675676h27.675676c6.457658 0 13.837838-6.457658 13.837838-13.837838s-6.457658-13.837838-13.837838-13.837838c7.38018-2.767568-23.985586-2.767568-23.985586-2.767567zM63.654054 690.046847c-31.365766 0-59.041441-27.675676-59.041441-59.041442 0-31.365766 27.675676-59.041441 59.041441-59.041441s59.041441 27.675676 59.041441 59.041441c-0.922523 35.055856-28.598198 59.041441-59.041441 59.041442z m0-27.675676c17.527928 0 27.675676-13.837838 27.675676-27.675676 0-17.527928-13.837838-27.675676-27.675676-27.675675-17.527928 0-27.675676 13.837838-27.675676 27.675675-3.69009 13.837838 10.147748 27.675676 27.675676 27.675676z m1573.823423-166.054054c-13.837838 0-27.675676-10.147748-27.675675-27.675676 0-13.837838 10.147748-27.675676 27.675675-27.675675 13.837838 0 27.675676 10.147748 27.675676 27.675675s-10.147748 27.675676-27.675676 27.675676z m0-10.147748c6.457658 0 13.837838-6.457658 13.837838-13.837837s-6.457658-13.837838-13.837838-13.837838-13.837838 6.457658-13.837837 13.837838 7.38018 13.837838 13.837837 13.837837zM460.338739 68.266667c10.147748-10.147748 23.985586-10.147748 34.133333 0l86.717117 86.717117c10.147748 10.147748 10.147748 23.985586 0 34.133333s-23.985586 10.147748-34.133333 0l-86.717117-86.717117c-10.147748-10.147748-10.147748-23.985586 0-34.133333zM826.58018 9.225225c13.837838 0 23.985586 10.147748 23.985586 23.985586v120.85045c0 13.837838-10.147748 23.985586-23.985586 23.985586S802.594595 167.899099 802.594595 154.061261V33.210811C801.672072 23.063063 812.742342 9.225225 826.58018 9.225225z m362.551352 55.351352c10.147748 10.147748 10.147748 23.985586 0 34.133333l-83.027027 79.336937c-10.147748 10.147748-23.985586 10.147748-34.133334 0s-10.147748-23.985586 0-34.133333l83.027027-83.027028c9.225225-6.457658 26.753153-6.457658 34.133334 3.690091z"
                  p-id="11553"
                ></path>
              </DCustomIcon>
            }
          ></DEmpty>
        ) : (
          aData.map((data, index) => {
            const id = aKey(data, index);
            const expandNode = !isUndefined(aExpand) ? aExpand(data, index) : false;

            return (
              <DCard key={id} className="mb-3">
                {(titleIndex !== -1 || columns[0].checkbox) && (
                  <DCard.Header
                    className="app-table__card-header"
                    dAction={
                      aActions
                        ? (() => {
                            const actions = aActions.actions(data, index).filter((action) => !action.hidden);
                            if (actions.length === 0) {
                              return undefined;
                            }

                            return actions.length === 1 && actions[0].link ? (
                              (() => {
                                const action = actions[0];
                                const node = action.link ? (
                                  <Link className="app-link" to={action.link}>
                                    <EllipsisOutlined />
                                  </Link>
                                ) : (
                                  <DButton dType="link" dIcon={<EllipsisOutlined />} onClick={action.onclick}></DButton>
                                );
                                return action.render ? action.render(node) : node;
                              })()
                            ) : (
                              <DDropdown
                                dList={actions.map((action, indexOfAction) => ({
                                  id: indexOfAction,
                                  label: action.text,
                                  type: 'item',
                                }))}
                                dPlacement="bottom-right"
                                onItemClick={(id) => {
                                  if (actions[id].link) {
                                    navigate(actions[id].link!);
                                  } else {
                                    return actions[id].onclick?.();
                                  }
                                }}
                              >
                                <DButton dType="link" dIcon={<EllipsisOutlined />}></DButton>
                              </DDropdown>
                            );
                          })()
                        : undefined
                    }
                  >
                    {(() => {
                      const checkbox: any = columns[0].checkbox ? columns[0].td : false;
                      const content = titleIndex !== -1 && columns[titleIndex].td;

                      return (
                        <>
                          {checkbox && checkbox(data, index)}
                          {content && <span>{isString(content) ? get(data, content) : content(data, index)}</span>}
                        </>
                      );
                    })()}
                  </DCard.Header>
                )}
                <DCard.Content>
                  <AppDetailView
                    aCol={12}
                    aGutter={3}
                    aVertical
                    aList={columns
                      .filter((column, indexOfCol) => !column.checkbox && indexOfCol !== titleIndex)
                      .map((column) => ({
                        label: column.th as string,
                        content: isString(column.td) ? get(data, column.td) : column.td(data, index),
                      }))}
                  />
                </DCard.Content>
                {(() => {
                  if (aActions && titleIndex === -1 && !columns[0].checkbox) {
                    const actions = aActions.actions(data, index).filter((action) => !action.hidden);
                    if (actions.length === 0) {
                      return;
                    }

                    const getAction = (action: typeof actions[0]) => {
                      const node = action.link ? (
                        <DCard.Action
                          title="edit"
                          onClick={() => {
                            navigate(action.link!);
                          }}
                        >
                          {action.text}
                        </DCard.Action>
                      ) : (
                        <DCard.Action disabled={action.loading} onClick={action.onclick}>
                          {action.loading ? <LoadingOutlined dSpin /> : action.text}
                        </DCard.Action>
                      );
                      return action.render ? action.render(node) : node;
                    };

                    return (
                      <DCard.Actions
                        dActions={
                          actions.length > 2
                            ? [
                                getAction(actions[0]),
                                <DDropdown
                                  dList={actions.slice(1).map((action, indexOfAction) => ({
                                    id: indexOfAction + 1,
                                    label: action.text,
                                    type: 'item',
                                  }))}
                                  dPlacement="bottom-right"
                                  onItemClick={(id) => {
                                    if (actions[id].link) {
                                      navigate(actions[id].link!);
                                    } else {
                                      return actions[id].onclick?.();
                                    }
                                  }}
                                >
                                  <DCard.Action>
                                    <EllipsisOutlined />
                                  </DCard.Action>
                                </DDropdown>,
                              ]
                            : actions.map((action) => getAction(action))
                        }
                      ></DCard.Actions>
                    );
                  }
                })()}
                {expandNode !== false && (
                  <div className="app-table__expand">
                    {expands.has(id) && <div style={{ padding: 16 }}>{expandNode}</div>}
                    <div
                      className={getClassName('app-table__expand-button', {
                        'is-expand': expands.has(id),
                      })}
                      onClick={() => {
                        setExpands((draft) => {
                          if (draft.has(id)) {
                            draft.delete(id);
                          } else {
                            draft.add(id);
                          }
                        });
                      }}
                    >
                      <DButton dType="link" dIcon={expands.has(id) ? <CaretUpOutlined /> : <CaretDownOutlined />}></DButton>
                    </div>
                  </div>
                )}
              </DCard>
            );
          })
        )}
      </div>
    </>
  );
}
