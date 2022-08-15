import type { DIconProps } from '../Icon';

import { QuestionCircleTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function QuestionCircleTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
