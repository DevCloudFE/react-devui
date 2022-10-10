import type { SwiperSlideProps } from 'swiper/react';

import { registerComponentMate } from '../../utils';
import { useComponentConfig } from '../root';

export type DSlidesSlideProps = SwiperSlideProps;

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DSlides.Slide' as const });
export function DSlidesSlide(props: DSlidesSlideProps): JSX.Element | null {
  useComponentConfig(COMPONENT_NAME, props);

  return null;
}
