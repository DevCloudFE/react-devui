import type { DIconProps } from '../Icon';

import { MailOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function MailOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
