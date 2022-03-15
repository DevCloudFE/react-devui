import type { DIconProps } from '../Icon';

import { SketchOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function SketchOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
