import React from 'react';

import { checkNodeExist, getClassName } from '@react-devui/utils';

import { usePrefixConfig, useComponentConfig } from '../../hooks';
import { registerComponentMate } from '../../utils';

export interface DTimelineItem {
  content: [React.ReactNode, React.ReactNode];
  icon?: React.ReactNode;
  status?: 'completed' | 'active' | 'wait' | 'error';
}

export interface DTimelineProps<T extends DTimelineItem> extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dList: T[];
  dVertical?: boolean;
  dLineSize?: number;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DTimeline' });
export function DTimeline<T extends DTimelineItem>(props: DTimelineProps<T>): JSX.Element | null {
  const {
    dList,
    dVertical = false,
    dLineSize = 36,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  const nodeExist = (() => {
    const hasNode = [false, false];
    for (const item of dList) {
      if (checkNodeExist(item.content[0])) {
        hasNode[0] = true;
      }
      if (checkNodeExist(item.content[1])) {
        hasNode[1] = true;
      }
    }
    return hasNode;
  })();

  return (
    <div
      {...restProps}
      className={getClassName(restProps.className, `${dPrefix}timeline`, {
        [`${dPrefix}timeline--vertical`]: dVertical,
      })}
    >
      {dVertical ? (
        <>
          {dList.map((item, index) => {
            const { content: itemContent, icon: itemIcon, status: itemStatus } = item;

            return (
              <React.Fragment key={index}>
                <div className={`${dPrefix}timeline__content`}>
                  {nodeExist[0] && (
                    <div className={getClassName(`${dPrefix}timeline__text`, `${dPrefix}timeline__text--left`)}>{itemContent[0]}</div>
                  )}
                  <div
                    className={getClassName(`${dPrefix}timeline__icon`, {
                      [`is-${itemStatus}`]: itemStatus,
                    })}
                    style={{ width: dLineSize }}
                  >
                    <div
                      className={getClassName(`${dPrefix}timeline__separator`, {
                        [`${dPrefix}timeline__separator--hidden`]: index === 0,
                      })}
                    ></div>
                    {checkNodeExist(itemIcon) ? itemIcon : <div className={`${dPrefix}timeline__dot`}></div>}
                    <div
                      className={getClassName(`${dPrefix}timeline__separator`, {
                        [`${dPrefix}timeline__separator--hidden`]: index === dList.length - 1,
                      })}
                    ></div>
                  </div>
                  {nodeExist[1] && <div className={`${dPrefix}timeline__text`}>{itemContent[1]}</div>}
                </div>
                {index !== dList.length - 1 && (
                  <div className={getClassName(`${dPrefix}timeline__content`, `${dPrefix}timeline__content--gap`)}>
                    {nodeExist[0] && <div className={getClassName(`${dPrefix}timeline__text`, `${dPrefix}timeline__text--left`)}></div>}
                    <div className={`${dPrefix}timeline__icon`} style={{ width: dLineSize }}>
                      <div className={`${dPrefix}timeline__separator`}></div>
                    </div>
                    {nodeExist[1] && <div className={`${dPrefix}timeline__text`}></div>}
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </>
      ) : (
        <>
          {nodeExist[0] && (
            <div className={`${dPrefix}timeline__text-container`}>
              {dList.map((item, index) => (
                <div key={index} className={`${dPrefix}timeline__text`}>
                  {item.content[0]}
                </div>
              ))}
            </div>
          )}
          <div className={`${dPrefix}timeline__icon-container`} style={{ height: dLineSize }}>
            {dList.map((item, index) => {
              const { icon: itemIcon, status: itemStatus } = item;

              return (
                <div
                  key={index}
                  className={getClassName(`${dPrefix}timeline__icon`, {
                    [`is-${itemStatus}`]: itemStatus,
                  })}
                >
                  <div
                    className={getClassName(`${dPrefix}timeline__separator`, {
                      [`${dPrefix}timeline__separator--hidden`]: index === 0,
                    })}
                  ></div>
                  {checkNodeExist(itemIcon) ? itemIcon : <div className={`${dPrefix}timeline__dot`}></div>}
                  <div
                    className={getClassName(`${dPrefix}timeline__separator`, {
                      [`${dPrefix}timeline__separator--hidden`]: index === dList.length - 1,
                    })}
                  ></div>
                </div>
              );
            })}
          </div>
          {nodeExist[1] && (
            <div className={`${dPrefix}timeline__text-container`}>
              {dList.map((item, index) => (
                <div key={index} className={`${dPrefix}timeline__text`}>
                  {item.content[1]}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
