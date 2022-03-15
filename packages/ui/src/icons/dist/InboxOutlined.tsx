import type { DIconProps } from '../Icon';

import { InboxOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function InboxOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
