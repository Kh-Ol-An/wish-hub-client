import React, { FC, useState, useEffect, useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Modal } from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { IWish } from '@/models/IWish';
import PageHeader from "@/layouts/PageHeader";
import { handleGetInitialWishList } from "@/utils/action-on-wishes";
import { Close as CloseIcon } from "@mui/icons-material";
import WishItem from "@/layouts/wish/WishItem";
import DetailWish from "@/layouts/wish/detail-wish/DetailWish";
import Action from "@/components/Action";
import StylesVariables from "@/styles/utils/variables.module.scss";

const Wish: FC = () => {
    const { t } = useTranslation();

    const myUser = useAppSelector((state) => state.myUser.user);
    const wishes = useAppSelector((state) => state.wishes);
    const users = useAppSelector((state) => state.users);
    const selectedUserId = useAppSelector((state) => state.selectedUser?.id);

    const location = useLocation();

    const dispatch = useAppDispatch();

    const [ showWish, setShowWish ] = useState<boolean>(false);
    const [ idOfSelectedWish, setIdOfSelectedWish ] = useState<IWish['id'] | null>(null);

    const wishListRef = useRef<HTMLUListElement>(null);

    const selectedUser = useMemo(
        () => users.list.find(user => user.id === selectedUserId),
        [ users.list, selectedUserId ],
    );
    const detailWish = useMemo(
        () => wishes.list.find(wish => wish.id === idOfSelectedWish),
        [ wishes.list, idOfSelectedWish ],
    );

    const handleShowWish = (id: IWish['id'] | null) => {
        setIdOfSelectedWish(id);
        setShowWish(true);
    };

    const handleHideWish = () => {
        setShowWish(false);
    };

    useEffect(() => {
        const userId = location.pathname.split('/')[2];
        handleGetInitialWishList(dispatch, myUser?.id, userId);
    }, []);

    return (
        <div className="wish-list-page container">
            <PageHeader />

            { wishes.list.length > 0 ? (
                <ul className="wish-list" ref={ wishListRef }>
                    { wishes.list.map((wish, idx) => (
                        <WishItem
                            key={ wish.id + idx }
                            wish={ wish }
                            showWish={ () => handleShowWish(wish.id) }
                        />
                    )) }
                </ul>
            ) : (
                <p className="wish-empty">{ t('wish-page.empty') }</p>
            ) }

            { detailWish && (
                <Modal
                    open={ showWish }
                    onClose={ handleHideWish }
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <div className="modal modal-lg">
                        <DetailWish
                            wish={ detailWish }
                            selectedUser={ selectedUser }
                            close={ handleHideWish }
                        />

                        <Action onClick={ handleHideWish }>
                            <CloseIcon sx={ { color: StylesVariables.blackColor } } />
                        </Action>
                    </div>
                </Modal>
            ) }
        </div>
    );
};

export default Wish;
