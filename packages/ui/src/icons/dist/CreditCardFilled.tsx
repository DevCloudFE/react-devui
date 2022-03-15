import type { DIconProps } from '../Icon';

import { CreditCardFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function CreditCardFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
