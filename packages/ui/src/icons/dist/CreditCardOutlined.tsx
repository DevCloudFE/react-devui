import type { DIconProps } from '../Icon';

import { CreditCardOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function CreditCardOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
