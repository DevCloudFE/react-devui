import type { DIconProps } from '../Icon';

import { CalculatorTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function CalculatorTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
