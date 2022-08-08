import type { SwiperSlideProps } from 'swiper/react';

import { useComponentConfig } from '../../hooks';
import { registerComponentMate } from '../../utils';

export type DSlideProps = SwiperSlideProps;

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DSlides.Slide' });
export function DSlide(props: DSlideProps): JSX.Element | null {
  useComponentConfig(COMPONENT_NAME, props);
  return null;
}
