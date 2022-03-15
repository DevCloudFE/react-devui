import type { DIconProps } from '../Icon';

import { ContactsOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function ContactsOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
