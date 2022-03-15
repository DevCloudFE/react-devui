import type { DIconProps } from '../Icon';

import { AuditOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function AuditOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
