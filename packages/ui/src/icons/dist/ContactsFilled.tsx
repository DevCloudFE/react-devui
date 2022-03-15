import type { DIconProps } from '../Icon';

import { ContactsFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function ContactsFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
