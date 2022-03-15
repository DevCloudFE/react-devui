import type { DIconProps } from '../Icon';

import { DingtalkOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function DingtalkOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
