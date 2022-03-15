import type { DIconProps } from '../Icon';

import { CalculatorOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function CalculatorOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
