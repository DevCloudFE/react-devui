import type { DIconProps } from '../Icon';

import { AliwangwangFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function AliwangwangFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
