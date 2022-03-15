import type { DIconProps } from '../Icon';

import { AlipaySquareFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function AlipaySquareFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
