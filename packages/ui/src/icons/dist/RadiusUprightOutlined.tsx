import type { DIconProps } from '../Icon';

import { RadiusUprightOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function RadiusUprightOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
