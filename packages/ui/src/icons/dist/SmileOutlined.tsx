import type { DIconProps } from '../Icon';

import { SmileOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function SmileOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
