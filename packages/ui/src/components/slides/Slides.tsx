import type { SwiperProps, SwiperSlideProps } from 'swiper/react';

import { isUndefined } from 'lodash';
import React from 'react';
import {
  A11y,
  Autoplay,
  Controller,
  EffectCoverflow,
  EffectCube,
  EffectFade,
  EffectFlip,
  EffectCreative,
  EffectCards,
  HashNavigation,
  History,
  Keyboard,
  Lazy,
  Mousewheel,
  Navigation,
  Pagination,
  Parallax,
  Scrollbar,
  Thumbs,
  Virtual,
  Zoom,
  FreeMode,
  Grid,
  Manipulation,
} from 'swiper';
import 'swiper/css/bundle';
import { Swiper, SwiperSlide } from 'swiper/react';

import { useComponentConfig, usePrefixConfig } from '../../hooks';
import { LeftOutlined, RightOutlined } from '../../icons';
import { getClassName, registerComponentMate } from '../../utils';

export type DSlidesProps = SwiperProps;

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DSlides' });
export function DSlides(props: DSlidesProps): JSX.Element | null {
  const {
    children,

    navigation: _navigation,
    pagination: _pagination,
    direction = 'horizontal',

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  const navigation = (() => {
    const configs = {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    };
    if (_navigation === true || isUndefined(_navigation)) {
      return configs;
    }
    if (_navigation !== false) {
      return Object.assign(configs, _navigation);
    }
    return _navigation;
  })();

  const pagination = (() => {
    const configs = {
      clickable: true,
    };
    if (_pagination === true || isUndefined(_pagination)) {
      return configs;
    }
    if (_pagination !== false) {
      return Object.assign(configs, _pagination);
    }
    return _pagination;
  })();

  return (
    <Swiper
      {...restProps}
      className={getClassName(restProps.className, `${dPrefix}slides`, {
        [`${dPrefix}slides--vertical`]: direction === 'vertical',
      })}
      direction={direction}
      modules={[
        A11y,
        Autoplay,
        Controller,
        EffectCoverflow,
        EffectCube,
        EffectFade,
        EffectFlip,
        EffectCreative,
        EffectCards,
        HashNavigation,
        History,
        Keyboard,
        Lazy,
        Mousewheel,
        Navigation,
        Pagination,
        Parallax,
        Scrollbar,
        Thumbs,
        Virtual,
        Zoom,
        FreeMode,
        Grid,
        Manipulation,
      ]}
      navigation={navigation}
      pagination={pagination}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.createElement(SwiperSlide, {
              ...(child.props as SwiperSlideProps),
              className: getClassName((child.props as SwiperSlideProps).className, `${dPrefix}slide`),
            })
          : child
      )}
      <button className="swiper-button-prev">
        <LeftOutlined />
      </button>
      <button className="swiper-button-next">
        <RightOutlined />
      </button>
    </Swiper>
  );
}
