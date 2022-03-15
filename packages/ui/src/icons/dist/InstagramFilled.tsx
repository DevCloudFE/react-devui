import type { DIconProps } from '../Icon';

import { InstagramFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function InstagramFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
