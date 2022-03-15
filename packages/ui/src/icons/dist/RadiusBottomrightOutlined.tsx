import type { DIconProps } from '../Icon';

import { RadiusBottomrightOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function RadiusBottomrightOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
