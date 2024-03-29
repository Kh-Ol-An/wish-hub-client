import React, { FC, useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCube, FreeMode, Navigation, Thumbs } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-cube';
import 'swiper/css/pagination';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import { IWish } from '@/models/IWish';
import stylesVariables from '@/styles/utils/variables.module.scss';

interface IProps {
    wish: IWish;
}

const WishSwiper: FC<IProps> = ({ wish }) => {
    const [thumbsSwiper, setThumbsSwiper] = useState(null);
    const [screenWidth, setScreenWidth] = useState<number>(window.innerWidth);

    let slidesPerView = 3;
    screenWidth >= 390 && (slidesPerView = 4);
    screenWidth >= 600 && (slidesPerView = 5);

    useEffect(() => {
        const handleResize = () => {
            setScreenWidth(window.innerWidth);
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return (
        <div className="wish-swiper">
            <Swiper
                className="swiper-cube"
                style={{
                    '--swiper-navigation-color': stylesVariables.primaryColor,
                }}
                effect={wish.images.length > 1 && 'cube'}
                grabCursor={true}
                cubeEffect={{
                    shadow: screenWidth >= 768,
                    slideShadows: true,
                    shadowOffset: 20,
                    shadowScale: 0.94,
                }}
                thumbs={{ swiper: thumbsSwiper }}
                navigation={wish.images.length > 1}
                modules={[EffectCube, FreeMode, Navigation, Thumbs]}
            >
                {wish.images.map((image) => (
                    <SwiperSlide key={image.id}>
                        <img
                            src={image.path}
                            alt={`wish-${image.position}`}
                        />
                    </SwiperSlide>
                ))}
            </Swiper>

            {wish.images.length > 1 && (
                <Swiper
                    className="swiper-nav"
                    style={{
                        '--swiper-navigation-color': stylesVariables.primaryColor,
                    }}
                    spaceBetween={8}
                    slidesPerView={slidesPerView}
                    watchSlidesProgress={true}
                    navigation={true}
                    modules={[FreeMode, Navigation, Thumbs]}
                    onSwiper={setThumbsSwiper}
                >
                    {wish.images.map((image) => (
                        <SwiperSlide key={image.id}>
                            <img
                                src={image.path}
                                alt={`wish-${image.position}`}
                            />
                        </SwiperSlide>
                    ))}
                </Swiper>
            )}
        </div>
    );
};

export default WishSwiper;
