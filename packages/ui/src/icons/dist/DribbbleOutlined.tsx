import type { DIconProps } from '../Icon';

import { DribbbleOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function DribbbleOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
