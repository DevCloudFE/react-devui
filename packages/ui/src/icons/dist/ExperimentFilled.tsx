import type { DIconProps } from '../Icon';

import { ExperimentFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function ExperimentFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
