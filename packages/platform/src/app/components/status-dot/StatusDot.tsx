import { getClassName } from '@react-devui/utils';

export interface AppStatusDotProps extends React.HTMLAttributes<HTMLDivElement> {
  aTheme?: 'primary' | 'success' | 'warning' | 'danger';
  aColor?: string;
  aWave?: boolean;
  aSize?: string | number;
}

export function AppStatusDot(props: AppStatusDotProps): JSX.Element | null {
  const {
    children,
    aTheme,
    aColor,
    aWave = false,
    aSize,

    ...restProps
  } = props;

  return (
    <div
      {...restProps}
      className={getClassName(restProps.className, 'app-status-dot', {
        [`t-${aTheme}`]: aTheme,
        'app-status-dot--wave': aWave,
      })}
      style={{
        ...restProps.style,
        ...(aColor
          ? {
              [`--app-status-dot-color`]: aColor,
            }
          : {}),
      }}
    >
      <div
        className="app-status-dot__dot"
        style={{
          width: aSize,
          height: aSize,
        }}
      ></div>
      <div>{children}</div>
    </div>
  );
}
