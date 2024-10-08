import React, { FC, useState, useEffect, useRef, useMemo } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Avatar } from '@mui/material';
import { Cancel as CancelIcon } from '@mui/icons-material';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { DateValidationError } from '@mui/x-date-pickers/models';
import dayjs, { Dayjs } from 'dayjs';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { updateMyUser } from '@/store/my-user/thunks';
import { IUpdateMyUser } from '@/store/my-user/types';
import { TCurrentAvatar, IUser } from '@/models/IUser';
import { accountDeliveryAddress, accountFirstNameValidation, accountLastNameValidation } from '@/utils/validations';
import AvatarValidation from '@/utils/AvatarValidation';
import { getFullShortDate } from "@/utils/lang-action";
import { ALLOWED_FILE_EXTENSIONS } from '@/utils/constants';
import Input from '@/components/Input';
import Button from '@/components/Button';
import StylesVariables from '@/styles/utils/variables.module.scss';
import { Tooltip } from "react-tooltip";
import getTooltipStyles from "@/utils/get-tooltip-styles";
import PrivacyChoices from "@/components/PrivacyChoices";
import { EShow } from "@/models/IWish";

interface IProps {
    cancel: () => void;
}

type Inputs = {
    firstName: IUser['firstName']
    lastName: IUser['lastName']
    deliveryAddress: IUser['deliveryAddress']
}

const EditAccount: FC<IProps> = ({ cancel }) => {
    const { t } = useTranslation();

    const myUser = useAppSelector((state) => state.myUser.user);

    const dispatch = useAppDispatch();

    const {
        register,
        setValue,
        watch,
        handleSubmit,
        formState: { errors },
    } = useForm<Inputs>();

    const inputRef = useRef<HTMLInputElement>(null);

    const [ clickedOnSubmit, setClickedOnSubmit ] = useState<boolean>(false);
    const [ avatar, setAvatar ] = useState<TCurrentAvatar>('');
    const [ showEmail, setShowEmail ] = useState<EShow>(EShow.ALL);
    const [ showDeliveryAddress, setShowDeliveryAddress ] = useState<EShow>(EShow.ALL);
    const [ birthday, setBirthday ] = useState<Dayjs | null>(null);
    const [ birthdayError, setBirthdayError ] = useState<DateValidationError | null>(null);
    const [ showBirthday, setShowBirthday ] = useState<EShow>(EShow.ALL);
    const [ screenWidth, setScreenWidth ] = useState<number>(window.innerWidth);

    const birthdayErrorMessage = useMemo(() => {
        if (!clickedOnSubmit) return;

        switch (birthdayError) {
            case 'minDate': {
                return t('profile-page.birthday-error.min-date');
            }
            case 'disableFuture': {
                return t('profile-page.birthday-error.disable-future');
            }
            case 'invalidDate': {
                return t('profile-page.birthday-error.invalid-date');
            }
            default: {
                return '';
            }
        }
    }, [ clickedOnSubmit, birthdayError ]);

    const onSubmit: SubmitHandler<Inputs> = async (data) => {
        setClickedOnSubmit(true);

        if (!myUser || (birthdayError && birthdayError.length > 0)) return;

        const updateMyUserData: IUpdateMyUser = {
            userId: myUser.id,
            firstName: data.firstName.trim(),
            avatar,
            showEmail,
        };
        if (data.lastName) {
            updateMyUserData.lastName = data.lastName.trim();
        }
        if (data.deliveryAddress) {
            updateMyUserData.deliveryAddress = data.deliveryAddress.trim();
            updateMyUserData.showDeliveryAddress = showDeliveryAddress;
        }
        if (birthday) {
            updateMyUserData.birthday = birthday.format();
            updateMyUserData.showBirthday = showBirthday;
        }
        await dispatch(updateMyUser(updateMyUserData));

        cancel();
    };

    const removeAvatar = () => {
        setAvatar('delete');
        inputRef.current && (inputRef.current.value = '');
    };

    const showAvatar = () => {
        if (avatar instanceof File) {
            return URL.createObjectURL(avatar);
        }

        return avatar || '';
    };

    useEffect(() => {
        if (!myUser) return;

        setValue('firstName', myUser.firstName);
        myUser.lastName && setValue('lastName', myUser.lastName);
        setAvatar(myUser.avatar || '');
        setShowEmail(myUser.showEmail);
        myUser.deliveryAddress && setValue('deliveryAddress', myUser.deliveryAddress);
        setShowDeliveryAddress(myUser.showDeliveryAddress);
        myUser.birthday && setBirthday(dayjs(myUser.birthday));
        setShowBirthday(myUser.showBirthday);
    }, [ myUser, setValue ]);

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
        <form className="edit-account" onSubmit={ handleSubmit(onSubmit) }>
            <Input
                { ...register("firstName", accountFirstNameValidation) }
                id="firstName"
                name="firstName"
                type="text"
                label={ t('first-name') }
                error={ errors?.firstName?.message }
            />

            <Input
                { ...register("lastName", accountLastNameValidation) }
                id="lastName"
                name="lastName"
                type="text"
                label={ t('last-name') }
                error={ errors?.lastName?.message }
            />

            <div className="avatar-box">
                <div>
                    <div className="avatar">
                        <label htmlFor="avatar">
                            <input
                                className="hidden"
                                id="avatar"
                                ref={ inputRef }
                                accept={ Object.values(ALLOWED_FILE_EXTENSIONS).join(",") }
                                type="file"
                                onChange={ (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;

                                    setAvatar(file);
                                } }
                            />
                            <Avatar
                                sx={ { cursor: 'pointer', width: '100%', height: '100%' } }
                                src={ showAvatar() } alt={ `${ myUser?.firstName } ${ myUser?.lastName }` }
                            />
                        </label>

                        { (avatar instanceof File || (avatar.length > 0 && avatar !== 'delete')) && (
                            <button className="remove" type="button" onClick={ removeAvatar }>
                                <CancelIcon sx={ { color: StylesVariables.actionColor } } />
                            </button>
                        ) }
                    </div>

                    <AvatarValidation avatar={ avatar } />
                </div>

                <div className="edit-account-email-box">
                    <span className="edit-account-email">
                        { myUser?.email }
                    </span>

                    {/* Privacy Choices Email */ }
                    <PrivacyChoices
                        id="email"
                        tooltipContent={{
                            all: t('main-page.can-see.email-all-tooltip'),
                            friends: t('main-page.can-see.email-friends-tooltip'),
                            nobody: t('main-page.can-see.email-nobody-tooltip'),
                        }}
                        show={ showEmail }
                        changeShow={ setShowEmail }
                    />
                </div>
            </div>

            <div className="edit-account-field delivery-address">
                <Input
                    { ...register("deliveryAddress", accountDeliveryAddress) }
                    id="deliveryAddress"
                    name="deliveryAddress"
                    type="text"
                    label={ t('profile-page.delivery-address') }
                    tooltip={ t('profile-page.delivery-address-tooltip') }
                    error={ errors?.deliveryAddress?.message }
                />
                <Tooltip
                    id="deliveryAddress"
                    style={ getTooltipStyles(screenWidth) }
                />

                {/* Privacy Choices Delivery Address */ }
                {watch('deliveryAddress') && (
                    <PrivacyChoices
                        id="delivery-address"
                        tooltipContent={{
                            all: t('main-page.can-see.delivery-address-all-tooltip'),
                            friends: t('main-page.can-see.delivery-address-friends-tooltip'),
                            nobody: t('main-page.can-see.delivery-address-nobody-tooltip'),
                        }}
                        show={ showDeliveryAddress }
                        changeShow={ setShowDeliveryAddress }
                    />
                )}
            </div>

            <div className="edit-account-field">
                <div
                    className={ "date-picker" + (clickedOnSubmit ? " clicked-on-submit" : "") }
                    title={ t('profile-page.when_your_birth') }
                >
                    <DemoContainer components={ [ 'DesktopDatePicker' ] }>
                        <DesktopDatePicker
                            label={ t('profile-page.birthday*') }
                            format={ getFullShortDate() }
                            dayOfWeekFormatter={ (weekday) => weekday }
                            minDate={ dayjs().subtract(120, 'years') } // Дозволити вибір дати до 120 років в минулому
                            disableFuture
                            value={ birthday }
                            onChange={ (value) => setBirthday(value) }
                            onError={ (newError) => setBirthdayError(newError) }
                            slotProps={ {
                                textField: {
                                    helperText: birthdayErrorMessage,
                                },
                            } }
                        />
                    </DemoContainer>
                </div>

                {/* Privacy Choices Birthday */ }
                { birthday && (
                    <PrivacyChoices
                        id="birthday"
                        tooltipContent={{
                            all: t('main-page.can-see.birthday-all-tooltip'),
                            friends: t('main-page.can-see.birthday-friends-tooltip'),
                            nobody: t('main-page.can-see.birthday-nobody-tooltip'),
                        }}
                        show={ showBirthday }
                        changeShow={ setShowBirthday }
                    />
                ) }
            </div>

            <div className="actions">
                <Button type="submit" variant="text" color="action-color">
                    { t('main-page.update') }
                </Button>

                <Button type="button" onClick={ cancel }>
                    { t('profile-page.cancel') }
                </Button>
            </div>
        </form>
    );
};

export default EditAccount;
