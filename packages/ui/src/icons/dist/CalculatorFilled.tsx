import type { DIconProps } from '../Icon';

import { CalculatorFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function CalculatorFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
