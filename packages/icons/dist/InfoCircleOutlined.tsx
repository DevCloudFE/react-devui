import type { DIconProps } from '../Icon';

import { InfoCircleOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function InfoCircleOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
