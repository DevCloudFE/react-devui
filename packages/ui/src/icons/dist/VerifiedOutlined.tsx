import type { DIconProps } from '../Icon';

import { VerifiedOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function VerifiedOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
