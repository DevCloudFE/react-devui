import type { DIconProps } from '../Icon';

import { FileWordOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function FileWordOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
