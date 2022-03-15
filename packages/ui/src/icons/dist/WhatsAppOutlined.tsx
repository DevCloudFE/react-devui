import type { DIconProps } from '../Icon';

import { WhatsAppOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function WhatsAppOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
