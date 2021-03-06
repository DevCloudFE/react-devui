import { isNumber, isUndefined } from 'lodash';

import { usePrefixConfig, useComponentConfig } from '../../hooks';
import { CheckOutlined, CloseOutlined } from '../../icons';
import { checkNodeExist, getClassName, registerComponentMate } from '../../utils';
import { TTANSITION_DURING_BASE } from '../../utils/global';
import { DCollapseTransition } from '../_transition';
import { DProgress } from '../progress';

export interface DStepperItem {
  step?: number;
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  status?: 'completed' | 'process' | 'wait' | 'error';
}

export interface DStepperProps<T extends DStepperItem> extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dList: T[];
  dActive?: number;
  dPercent?: number;
  dVertical?: boolean;
  dIconSize?: number;
  dLabelBottom?: boolean;
  dClickable?: boolean;
  onItemClick?: (step: number, item: T) => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DStepper' });
export function DStepper<T extends DStepperItem>(props: DStepperProps<T>): JSX.Element | null {
  const {
    dList,
    dActive,
    dPercent,
    dVertical = false,
    dIconSize = 36,
    dLabelBottom = false,
    dClickable = false,
    onItemClick,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  const active = dActive ?? dList[0].step ?? 1;

  return (
    <div
      {...restProps}
      className={getClassName(restProps.className, `${dPrefix}stepper`, {
        [`${dPrefix}stepper--label-bottom`]: dLabelBottom,
        [`${dPrefix}stepper--vertical`]: dVertical,
        [`${dPrefix}stepper--button`]: dClickable,
      })}
    >
      {dList.map((step, index) => {
        const { step: stepStep = index + 1, title: stepTitle, description: stepDescription, icon: stepIcon, status: stepStatus } = step;

        const isCompleted = stepStep < active;
        const isActive = stepStep === active;
        const isWait = stepStep > active;

        const isProgress = isActive && isNumber(dPercent);

        const titleNode = (
          <div
            className={`${dPrefix}stepper__step-title`}
            style={{ marginTop: dLabelBottom ? undefined : `calc((${dIconSize}px - 1.1em) / 2)` }}
          >
            {stepTitle}
          </div>
        );

        const separatoreNode =
          dVertical && dLabelBottom
            ? null
            : index !== dList.length - 1 && (
                <div
                  className={`${dPrefix}stepper__step-separator`}
                  style={{
                    top: dVertical ? `${dIconSize}px` : `calc((${dIconSize}px - 2px) / 2)`,
                    left: dVertical ? `${dIconSize / 2}px` : dLabelBottom ? `calc(50% + ${dIconSize / 2}px)` : undefined,
                    width: !dVertical && dLabelBottom ? `calc(100% - ${dIconSize}px)` : undefined,
                    height: dVertical ? `calc(100% - ${dIconSize}px)` : undefined,
                  }}
                ></div>
              );

        return (
          <div
            key={stepStep}
            className={getClassName(
              `${dPrefix}stepper__step`,
              isUndefined(stepStatus)
                ? {
                    'is-completed': isCompleted,
                    'is-active': isActive,
                    'is-wait': isWait,
                  }
                : {},
              {
                [`is-${stepStatus}`]: stepStatus,
                [`${dPrefix}stepper__step--last`]: index === dList.length - 1,
              }
            )}
            style={{
              maxWidth: !dVertical && index === dList.length - 1 ? `calc(100% / ${dList.length})` : undefined,
              width: !dVertical && dLabelBottom ? `calc(100% / ${dList.length})` : undefined,
            }}
            role={dClickable ? 'button' : undefined}
            tabIndex={dClickable ? 0 : undefined}
            onKeyDown={(e) => {
              if (dClickable) {
                if (e.code === 'Enter' || e.code === 'Space') {
                  e.preventDefault();

                  onItemClick?.(stepStep, step);
                }
              }
            }}
            onClick={() => {
              if (dClickable) {
                onItemClick?.(stepStep, step);
              }
            }}
          >
            <div className={`${dPrefix}stepper__step-header`}>
              <div
                className={getClassName(`${dPrefix}stepper__step-icon`, {
                  [`${dPrefix}stepper__step-icon--progress`]: isProgress,
                })}
                style={{
                  width: dIconSize,
                  height: dIconSize,
                }}
              >
                {stepIcon === false ? null : checkNodeExist(stepIcon) ? (
                  stepIcon
                ) : stepStatus === 'error' ? (
                  <CloseOutlined />
                ) : isCompleted ? (
                  <CheckOutlined />
                ) : (
                  stepStep
                )}
                {isProgress && (
                  <DProgress
                    className={`${dPrefix}stepper__step-progress`}
                    dStatus="process"
                    dPercent={dPercent}
                    dSize={dIconSize + 8}
                    dLineWidth={2}
                    dType="circle"
                    dLabel={false}
                  ></DProgress>
                )}
              </div>
              {!dLabelBottom && titleNode}
              {!dVertical && separatoreNode}
            </div>
            {dLabelBottom && titleNode}
            {dVertical && separatoreNode}
            {checkNodeExist(stepDescription) && (
              <DCollapseTransition
                dSize={0}
                dIn={!dVertical || isActive}
                dDuring={TTANSITION_DURING_BASE}
                dStyles={{
                  entering: {
                    transition: ['height', 'padding', 'margin'].map((attr) => `${attr} ${TTANSITION_DURING_BASE}ms ease-out`).join(', '),
                  },
                  leaving: {
                    transition: ['height', 'padding', 'margin'].map((attr) => `${attr} ${TTANSITION_DURING_BASE}ms ease-in`).join(', '),
                  },
                  leaved: { display: 'none' },
                }}
              >
                {(ref, collapseStyle) => (
                  <div
                    ref={ref}
                    className={`${dPrefix}stepper__step-description`}
                    style={{
                      ...collapseStyle,
                      marginLeft: dLabelBottom ? undefined : `calc(${dIconSize}px + 8px)`,
                    }}
                  >
                    {stepDescription}
                  </div>
                )}
              </DCollapseTransition>
            )}
          </div>
        );
      })}
    </div>
  );
}
