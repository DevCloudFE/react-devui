import type { DIconProps } from '../Icon';

import { CaretDownFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function CaretDownFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
