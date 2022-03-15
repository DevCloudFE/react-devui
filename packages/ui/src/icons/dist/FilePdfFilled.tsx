import type { DIconProps } from '../Icon';

import { FilePdfFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function FilePdfFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
