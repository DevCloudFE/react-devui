import type { DIconProps } from '../Icon';

import { NodeCollapseOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function NodeCollapseOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
