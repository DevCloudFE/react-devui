import type { DIconProps } from '../Icon';

import { FilePptOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function FilePptOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
