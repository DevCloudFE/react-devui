import type { DIconProps } from '../Icon';

import { SlackOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function SlackOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
