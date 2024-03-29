import React, { FC, useState } from 'react';
import { SubmitHandler, useForm } from "react-hook-form";
import { Avatar, Modal } from '@mui/material';
import {
    Settings as SettingsIcon,
    ManageAccounts as ManageAccountsIcon,
    Logout as LogoutIcon,
    Close as CloseIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import 'dayjs/locale/uk';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { logout, deleteMyUser } from '@/store/my-user/thunks';
import { getWishList } from '@/store/wishes/thunks';
import { selectUserId } from '@/store/selected-user/slice';
import { emailValidation, passwordValidation } from "@/utils/validations";
import Card from '@/layouts/Card';
import DetailAccount from '@/layouts/DetailAccount';
import EditAccount from '@/layouts/EditAccount';
import Button from '@/components/Button';
import Action from '@/components/Action';
import Popup from "@/components/Popup";
import Input from "@/components/Input";
import Logo from '@/components/Logo';
import stylesVariables from '@/styles/utils/variables.module.scss';

interface IProps {
    open: boolean;
    close: () => void;
}

type Inputs = {
    email: string
    password: string
}

const Header: FC<IProps> = ({ open, close }) => {
    const myUser = useAppSelector((state) => state.myUser.user);
    const selectedUserId = useAppSelector((state) => state.selectedUser?.id);

    const dispatch = useAppDispatch();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<Inputs>();

    const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
    const [showDetailAccount, setShowDetailAccount] = useState<boolean>(false);
    const [showEditAccount, setShowEditAccount] = useState<boolean>(false);
    const [showConfirmDeleteMyUser, setShowConfirmDeleteMyUser] = useState<boolean>(false);

    const onSubmit: SubmitHandler<Inputs> = async (data) => {
        if (!myUser) return;

        await dispatch(deleteMyUser({ ...data, id: myUser.id }));
        close();
    };

    const handleSelectWish = async () => {
        if (!myUser) return;

        await dispatch(getWishList({ myId: myUser.id, userId: myUser.id }));
        await dispatch(selectUserId(myUser.id));
        localStorage.setItem('selectedUserId', myUser.id);
        close();
    };

    const handleShowDetailAccount = () => {
        setShowDetailAccount(true);
        close();
    };

    const handleHideDetailAccount = () => {
        setShowDetailAccount(false);
    };

    const handleShowEditAccount = () => {
        setShowEditAccount(true);
        setAnchor(null);
        close();
    };

    const handleHideEditAccount = () => {
        setShowEditAccount(false);
    };

    const handleShowConfirmDeleteMyUser = () => {
        setShowConfirmDeleteMyUser(true);
        setShowEditAccount(false);
    };

    const handleLogout = () => {
        dispatch(logout());
    };

    return (
        <div className={"header" + (open ? " open" : "")}>
            <div className="header-inner">
                <div className="header-content">
                    <div className="my-user">
                        <button className="avatar-box" type="button" onClick={handleShowDetailAccount}>
                            <Avatar alt={myUser?.firstName} src={myUser?.avatar} />

                            {myUser && myUser.successfulWishes > 0 && (
                                <span className="success wish-count">
                                    {myUser?.successfulWishes}
                                </span>
                            )}
                            {myUser && myUser.unsuccessfulWishes > 0 && (
                                <span className="unsuccess wish-count">
                                    {myUser?.unsuccessfulWishes}
                                </span>
                            )}
                        </button>

                        <button className="content" type="button" onClick={handleSelectWish}>
                            <span className={"name" + (myUser?.id === selectedUserId ? " selected" : "")}>
                                {myUser?.firstName} {myUser?.lastName}
                            </span>

                            <span className="params">
                                {
                                    myUser?.birthday
                                        ? `Д.н. ${dayjs(myUser?.birthday).locale('uk').format('DD MMMM')}`
                                        : myUser?.email
                                }
                            </span>
                        </button>
                    </div>

                    <Logo to="/welcome" withoutIcon />

                    {/* Settings */}
                    <Popup
                        anchor={anchor}
                        setAnchor={setAnchor}
                        actionIcon={<SettingsIcon sx={{ color: stylesVariables.specialColor }} />}
                    >
                        <Button variant="text" onClick={handleShowEditAccount}>
                            <ManageAccountsIcon />
                            Налаштування аккаунту
                        </Button>
                        <Button variant="text" onClick={handleLogout}>
                            <LogoutIcon />
                            Вийти з аккаунту
                        </Button>
                    </Popup>

                    {/* Detail Account */}
                    {myUser && (
                        <Modal
                            open={showDetailAccount}
                            onClose={handleHideDetailAccount}
                            aria-labelledby="modal-modal-title"
                            aria-describedby="modal-modal-description"
                        >
                            <div className="modal modal-md">
                                <Card>
                                    <DetailAccount user={myUser} />
                                </Card>

                                <Action onClick={handleHideDetailAccount}>
                                    <CloseIcon />
                                </Action>
                            </div>
                        </Modal>
                    )}

                    {/* Edit Account */}
                    <Modal
                        open={showEditAccount}
                        onClose={handleHideEditAccount}
                        aria-labelledby="modal-modal-title"
                        aria-describedby="modal-modal-description"
                    >
                        <div className="modal">
                            <Card>
                                <EditAccount
                                    close={handleHideEditAccount}
                                    handleShowConfirmDeleteMyUser={handleShowConfirmDeleteMyUser}
                                />
                            </Card>

                            <Action onClick={handleHideEditAccount}>
                                <CloseIcon />
                            </Action>
                        </div>
                    </Modal>

                    {/* Confirm Delete My User */}
                    <Modal
                        open={showConfirmDeleteMyUser}
                        aria-labelledby="modal-modal-title"
                        aria-describedby="modal-modal-description"
                    >
                        <form className="modal confirm" onSubmit={handleSubmit(onSubmit)}>
                            <Card classes="not-full-screen">
                                <h3 className="title attention">Увага!</h3>

                                <p className="text">
                                    Нашому суму не має меж... Ми сподіваємось що Ви дасте нам ще один шанс та залишитись.
                                    Якщо Ви рішуче вирішили покинути нас, то підтвердьте свій намір ввівши відповідні дані.
                                </p>

                                <Input
                                    {...register("email", emailValidation)}
                                    id="email"
                                    name="email"
                                    type="text"
                                    label="Email*"
                                    error={errors?.email?.message}
                                />

                                <Input
                                    {...register("password", passwordValidation)}
                                    id="password"
                                    name="password"
                                    type="password"
                                    label="Пароль*"
                                    error={errors?.password?.message}
                                />

                                <div className="modal-actions">
                                    <Button variant="text" color="action-color" type="submit">
                                        Видаліть мій акаунт
                                    </Button>

                                    <Button type="button" onClick={() => setShowConfirmDeleteMyUser(false)}>
                                        Залишитись
                                    </Button>
                                </div>
                            </Card>
                        </form>
                    </Modal>
                </div>
            </div>
        </div>
    );
};

export default Header;
