import type { DIconProps } from '../Icon';

import { CaretRightOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function CaretRightOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
