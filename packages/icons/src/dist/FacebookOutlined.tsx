import type { DIconProps } from '../Icon';

import { FacebookOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function FacebookOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
