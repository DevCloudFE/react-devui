import type { DIconProps } from '../Icon';

import { PoweroffOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function PoweroffOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
