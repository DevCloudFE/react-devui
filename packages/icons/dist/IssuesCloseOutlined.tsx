import type { DIconProps } from '../Icon';

import { IssuesCloseOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function IssuesCloseOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
