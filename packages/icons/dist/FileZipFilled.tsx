import type { DIconProps } from '../Icon';

import { FileZipFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function FileZipFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
