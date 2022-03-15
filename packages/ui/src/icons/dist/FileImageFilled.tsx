import type { DIconProps } from '../Icon';

import { FileImageFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function FileImageFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
