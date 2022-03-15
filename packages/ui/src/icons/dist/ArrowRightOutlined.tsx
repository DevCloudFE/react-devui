import type { DIconProps } from '../Icon';

import { ArrowRightOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function ArrowRightOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
