import type { DIconProps } from '../Icon';

import { QuestionOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function QuestionOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
