import type { DIconProps } from '../Icon';

import { AlipayCircleFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function AlipayCircleFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
