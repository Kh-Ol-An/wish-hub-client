import React, { useState, useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { useTranslation } from 'react-i18next';
import { Modal, MenuItem } from '@mui/material';
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { Close as CloseIcon, AddCircle as AddCircleIcon } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { selectUserId } from '@/store/selected-user/slice';
import { addAllWishes, getAllWishes, getWishList } from '@/store/wishes/thunks';
import { IWish } from '@/models/IWish';
import EditWish from '@/layouts/wish/edit-wish/EditWish';
import WishItem from '@/layouts/wish/WishItem';
import DetailWish from '@/layouts/wish/detail-wish/DetailWish';
import Loading from '@/layouts/Loading';
import Action from '@/components/Action';
import CustomModal from '@/components/CustomModal';
import LogoIcon from "@/assets/images/logo.svg";
import StylesVariables from '@/styles/utils/variables.module.scss';
import { USERS_PAGINATION_LIMIT, WISHES_PAGINATION_LIMIT } from "@/utils/constants";
import { addUsers, getAllUsers, getUsers } from "@/store/users/thunks";
import Search from "@/components/Search";

type TWishType = 'all' | 'unfulfilled' | 'fulfilled';

const WishList = () => {
    const { t } = useTranslation();

    const { ref, inView } = useInView({
        threshold: 0,
    });

    const myUser = useAppSelector((state) => state.myUser.user);
    const wishes = useAppSelector((state) => state.wishes);
    const users = useAppSelector((state) => state.users);
    const selectedUserId = useAppSelector((state) => state.selectedUser?.id);

    const dispatch = useAppDispatch();

    const [ search, setSearch ] = useState<string>('');
    const [ firstLoad, setFirstLoad ] = useState<boolean>(true);
    const [ wishType, setWishType ] = useState<TWishType>('all');
    const [ showWish, setShowWish ] = useState<boolean>(false);
    const [ showEditWish, setShowEditWish ] = useState<boolean>(false);
    const [ idOfSelectedWish, setIdOfSelectedWish ] = useState<IWish['id'] | null>(null);
    const [ selectedWishList, setSelectedWishList ] = useState<IWish[]>(wishes.list);
    const [ screenWidth, setScreenWidth ] = useState<number>(window.innerWidth);

    const wishListRef = useRef<HTMLUListElement>(null);

    const selectedUser = users.list.find(user => user.id === selectedUserId);
    const lastName = selectedUser?.lastName ? selectedUser.lastName : "";
    const detailWish = wishes.list.find(wish => wish.id === idOfSelectedWish);

    const wishesExample = [
        {
            name: t('main-page.wishes-example.first'),
        },
        {
            name: t('main-page.wishes-example.second'),
        },
        {
            name: t('main-page.wishes-example.third'),
        },
        {
            name: t('main-page.wishes-example.fourth'),
        }
    ]

    let emptyText;
    myUser?.id !== selectedUserId && (emptyText = (
        <>
            <span>{ t('main-page.at-user') }</span>
            <span className="empty-name">{ selectedUser?.firstName } { lastName }</span>
            <span>{ t(`main-page.does_not_have_${ wishType === 'all' ? '' : wishType }`) }</span>
        </>
    ));

    const handleChangeSearchBar = (value: string) => {
        setSearch(value);

        if (!wishListRef.current) return;

        wishListRef.current.scrollTo(0, 0);

        dispatch(getAllWishes({ page: 1, limit: WISHES_PAGINATION_LIMIT, search: value }));
    };

    const handleSelectWish = async () => {
        if (!myUser) return;

        await dispatch(getWishList({ myId: myUser.id, userId: myUser.id }));
        await dispatch(selectUserId(myUser.id));
        localStorage.setItem('selectedUserId', myUser.id);
    };

    const handleShowWish = (id: IWish['id'] | null) => {
        setIdOfSelectedWish(id);
        setShowWish(true);
    };

    const handleHideWish = () => {
        setShowWish(false);
    };

    const handleShowEditWish = (id: IWish['id'] | null) => {
        setIdOfSelectedWish(id);
        setShowEditWish(true);
    };

    const handleHideEditWish = () => {
        setShowEditWish(false);
    };

    const handleChangeWishType = (event: SelectChangeEvent) => {
        const value = event.target.value as TWishType;
        setWishType(value);

        if (!wishListRef.current) return;

        wishListRef.current.scrollTo(0, 0);
    };

    useEffect(() => {
        if (myUser) {
            if (wishType === 'all') {
                setSelectedWishList(wishes.list);
            }

            if (wishType === 'fulfilled') {
                setSelectedWishList(wishes.list.filter(wish => wish.executed));
            }

            if (wishType === 'unfulfilled') {
                setSelectedWishList(wishes.list.filter(wish => !wish.executed));
            }
        } else {
            setSelectedWishList(prevState => ([ ...prevState, ...wishes.list ]));
        }
    }, [ myUser, wishType, wishes.list ]);

    useEffect(() => {
        if (firstLoad) {
            setFirstLoad(false);
            return;
        }

        if (!inView || wishes.stopRequests) return;
        dispatch(addAllWishes({ page: wishes.page, limit: WISHES_PAGINATION_LIMIT, search }));
    }, [ inView ]);

    useEffect(() => {
        const selectedUserId = localStorage.getItem('selectedUserId');
        if (selectedUserId) {
            if (myUser) {
                dispatch(getWishList({ myId: myUser.id, userId: selectedUserId }));
                dispatch(selectUserId(selectedUserId));
            }
        } else {
            dispatch(getAllWishes({ page: 1, limit: WISHES_PAGINATION_LIMIT, search }));
        }

        const handleResize = () => {
            setScreenWidth(window.innerWidth);
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return (
        <div className="wish-list">
            <div className="head">
                <button className="wish-hub" type="button" onClick={ handleSelectWish }>
                    <span className="logo-name">Wish Hub</span>
                </button>

                { myUser && (
                    <div className="title-box">
                        <div className="wish-list-type">
                            <Select
                                id="wish-list-type"
                                variant="standard"
                                sx={ { fontSize: screenWidth < 1024 ? 20 : 24 } }
                                value={ wishType }
                                onChange={ handleChangeWishType }
                            >
                                <MenuItem value="all">{ t('main-page.all') }</MenuItem>
                                <MenuItem value="unfulfilled">{ t('main-page.unfulfilled') }</MenuItem>
                                <MenuItem value="fulfilled">{ t('main-page.fulfilled.plural') }</MenuItem>
                            </Select>
                        </div>

                        {
                            myUser.id === selectedUserId
                                ? <>
                                    <h2 className="title">{ t('main-page.title-personal') }</h2>
                                    <h2 className="title">{ t('main-page.title-wishes') }</h2>
                                </>
                                : <>
                                    <h2 className="title">{ t('main-page.title-wishes') }</h2>
                                    <h2 className="title">{ t('main-page.of-user') }</h2>
                                    <h2 className="title title-name">{ selectedUser?.firstName }</h2>
                                    <h2 className="title title-name">{ lastName }</h2>
                                </>
                        }
                    </div>
                ) }
                <Search
                    id="search"
                    label={ t('main-page.wishes-search') }
                    changeSearchBar={ handleChangeSearchBar }
                />
            </div>

            { (myUser?.id === selectedUserId || selectedWishList?.length > 0) ? (
                <ul className="list" ref={ wishListRef }>
                    { myUser?.id === selectedUserId && (
                        <li className="create-wish">
                            <button
                                className="create-wish-action"
                                type="button"
                                onClick={ () => handleShowEditWish(null) }
                            >
                                <AddCircleIcon className="create-wish-plus" />
                            </button>
                        </li>
                    ) }

                    { selectedWishList?.length > 0 && selectedWishList.map((wish, idx) => (
                        <WishItem
                            key={ wish.id + idx }
                            wish={ wish }
                            editWish={ () => handleShowEditWish(wish.id) }
                            showWish={ () => handleShowWish(wish.id) }
                        />
                    )) }

                    { wishesExample.map((wish, idx) => {
                        if (selectedWishList?.length > idx) return null;

                        return (
                            <li
                                key={ idx }
                                className={
                                    "wish-item"
                                    + (myUser?.id !== selectedUserId ? " opacity" : ` example_${ idx }`)
                                }
                                onClick={ () => handleShowEditWish(null) }
                            >
                                <div className="wish-box">
                                    <div className="wish-item-img">
                                        <img
                                            className="wish-item-img-icon"
                                            src={ LogoIcon }
                                            alt="Wish Hub Logo"
                                        />
                                    </div>

                                    <div className="wish-item-data">
                                        <div className="wish-item-name">
                                            { wish.name }
                                        </div>
                                    </div>
                                </div>
                            </li>
                        );
                    }) }

                    <div
                        className="observable-element"
                        style={ { display: users.stopRequests ? 'none' : 'block' } }
                        ref={ ref }
                    ></div>
                </ul>
            ) : (
                <div className="empty-box">
                    <p className="empty-text">{ emptyText }</p>
                </div>
            ) }

            {/* TODO: розбирись з цим, чому тут два прелоадери */ }
            { wishes.isLoading && <Loading /> }
            { wishes.isLocalLoading && <Loading isLocal /> }
            {/* TODO: розбирись з цим, чому тут два прелоадери */ }

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
                            editWish={ () => handleShowEditWish(idOfSelectedWish) }
                            close={ handleHideWish }
                        />

                        <Action onClick={ handleHideWish }>
                            <CloseIcon sx={ { color: StylesVariables.blackColor } } />
                        </Action>
                    </div>
                </Modal>
            ) }

            <CustomModal show={ showEditWish } hide={ handleHideEditWish }>
                <EditWish idOfSelectedWish={ idOfSelectedWish } close={ handleHideEditWish } />
            </CustomModal>
        </div>
    );
};

export default WishList;
