import type { DIconProps } from '../Icon';

import { FilePdfOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function FilePdfOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
