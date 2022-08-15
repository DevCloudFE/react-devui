import type { DIconProps } from '../Icon';

import { FilePptFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function FilePptFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
