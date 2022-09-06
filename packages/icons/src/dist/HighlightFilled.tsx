import type { DIconProps } from '../Icon';

import { HighlightFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function HighlightFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
