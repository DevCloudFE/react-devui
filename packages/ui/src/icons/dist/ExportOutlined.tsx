import type { DIconProps } from '../Icon';

import { ExportOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function ExportOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
