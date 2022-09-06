import type { DIconProps } from '../Icon';

import { MailTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function MailTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
