import type { DIconProps } from '../Icon';

import { MailFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function MailFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
