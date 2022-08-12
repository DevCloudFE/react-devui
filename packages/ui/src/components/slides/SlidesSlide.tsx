import type { SwiperSlideProps } from 'swiper/react';

import { useComponentConfig } from '../../hooks';
import { registerComponentMate } from '../../utils';

export type DSlidesSlideProps = SwiperSlideProps;

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DSlides.Slide' });
export function DSlidesSlide(props: DSlidesSlideProps): JSX.Element | null {
  useComponentConfig(COMPONENT_NAME, props);
  return null;
}
