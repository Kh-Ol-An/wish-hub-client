import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import LogoIcon from '@/assets/images/logo.svg';
import WishHub from '@/assets/images/wish-hub.png';

interface IProps {
    to?: string;
    withoutIcon?: boolean;
}

const Logo: FC<IProps> = ({ to = '/', withoutIcon = false }) => {
    return (
        <div className="logo">
            <Link className="logo-box" to={to}>
                {!withoutIcon && (
                    <img className="icon" src={LogoIcon} alt="logo" />
                )}
                <img className="name" src={WishHub} alt="Wish Hub" />
            </Link>
        </div>
    );
};

export default Logo;
