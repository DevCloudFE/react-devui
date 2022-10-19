import type { DCustomIconeProps } from '@react-devui/icons';

import { DCustomIcon } from '@react-devui/icons';

export function AppMapMarkerIcon(props: DCustomIconeProps): JSX.Element | null {
  const { dTheme = 'primary', dSize = 24, ...restProps } = props;

  return (
    <DCustomIcon {...restProps} viewBox="0 0 24 24" preserveAspectRatio="none" dTheme={dTheme} dSize={dSize}>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"></path>
    </DCustomIcon>
  );
}
