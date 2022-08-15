import type { DIconProps } from '../Icon';

import { DingdingOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function DingdingOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
