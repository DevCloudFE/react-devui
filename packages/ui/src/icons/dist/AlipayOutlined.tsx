import type { DIconProps } from '../Icon';

import { AlipayOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function AlipayOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
