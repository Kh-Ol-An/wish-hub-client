import React, { FC } from 'react';
import { addingWhiteSpaces } from '@/utils/formating-value';
import { IWish } from '@/models/IWish';
import { IUser } from '@/models/IUser';
import ShareButton from '@/components/ShareButton';

interface IProps {
    wish: IWish;
    myUserId?: IUser['id'];
}

const WishContent: FC<IProps> = ({ wish, myUserId }) => {
    let show = <>Ваше бажання бачать <span className="accent">всі</span> користувачі.</>;
    wish.show === 'friends' && (show = <>Ваше бажання бачать тільки <span className="accent">друзі</span>.</>);
    wish.show === 'nobody' && (show = <>Ваше бажання <span className="accent">ніхто</span> не баче.</>);

    let showRow = false;
    myUserId === wish.userId && (showRow = true);
    wish.price && (showRow = true);

    const isURL = (str: string) => {
        try {
            new URL(str);
            return true;
        } catch {
            return false;
        }
    };

    return (
        <>
            <div className="detail-wish-title">
                <h3 className="detail-wish-name">
                    {wish.name}
                </h3>

                <ShareButton />
            </div>

            {showRow && (
                <div className="detail-wish-row">
                    {myUserId === wish.userId && (
                        <p className="detail-wish-label">{show}</p>
                    )}

                    {wish.price && (
                        <div className="detail-wish-box">
                            <span className="detail-wish-label">Ціна:</span>
                            <span className="detail-wish-data">
                                {addingWhiteSpaces(wish.price)} {wish.currency || 'UAH'}
                            </span>
                        </div>
                    )}
                </div>
            )}

            {wish.address && (
                <p className="detail-wish-description">
                    <span className="label">Де можна придбати:</span>
                    {isURL(wish.address) ? (
                        <a
                            className="link"
                            href={wish.address}
                            title={wish.address}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {wish.address}
                        </a>
                    ) : (<>{wish.address}</>)}
                </p>
            )}

            {wish.description && (
                <p className="detail-wish-description">
                    <span className="label">Опис:</span>
                    <span className="value">{wish.description}</span>
                </p>
            )}
        </>
    );
};

export default WishContent;
