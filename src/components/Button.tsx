import React, { FC, ReactNode, MouseEventHandler } from 'react';
import { Link } from 'react-router-dom';

interface IProps {
    to?: string;
    target?: '_blank';
    tabIndex?: number;
    variant?: 'text';
    color?: 'action-color';
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    onClick?: (event: any) => void;
    children: ReactNode;
}

const Button: FC<IProps> = ({
    to,
    target,
    tabIndex = 0,
    variant,
    color,
    disabled,
    type,
    onClick,
    children,
}) => {
    const handleClick: MouseEventHandler<HTMLAnchorElement> = (event) => {
        disabled && event.preventDefault();
    };

    if (to) {
        return (
            <Link
                className={
                    "button"
                    + (color ? ` ${color}` : "")
                    + (variant ? ` ${variant}` : "")
                    + (disabled ? ' disabled' : "")
                }
                to={to}
                target={target}
                rel="noopener noreferrer"
                tabIndex={tabIndex}
                onClick={onClick || handleClick}
            >
                {children}
            </Link>
        );
    }

    return (
        <button
            className={
                "button"
                + (color ? ` ${color}` : "")
                + (variant ? ` ${variant}` : "")
                + (disabled ? ' disabled' : "")
            }
            type={type}
            tabIndex={tabIndex}
            disabled={disabled}
            onClick={onClick}
        >
            {children}
        </button>
    );
};

export default Button;
