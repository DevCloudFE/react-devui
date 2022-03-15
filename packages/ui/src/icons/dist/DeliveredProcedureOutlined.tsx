import type { DIconProps } from '../Icon';

import { DeliveredProcedureOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function DeliveredProcedureOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
