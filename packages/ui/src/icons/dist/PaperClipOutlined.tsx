import type { DIconProps } from '../Icon';

import { PaperClipOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function PaperClipOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
