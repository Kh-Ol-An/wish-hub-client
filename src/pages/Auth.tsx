import React, { ChangeEvent, FC, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { SubmitHandler, useForm } from 'react-hook-form';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { registration, login, forgotPassword, googleAuthorization } from '@/store/my-user/thunks';
import { IUser } from '@/models/IUser';
import { accountFirstNameValidation, emailValidation, passwordValidation } from '@/utils/validations';
import { getLang } from "@/utils/lang-action";
import Card from '@/layouts/Card';
import LanguageSelection from '@/components/LanguageSelection';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Logo from '@/components/Logo';
import Checkbox from '@/components/Checkbox';

interface IGoogleAuthCredentialResponse {
    email: IUser['email'];
    email_verified: IUser['isActivated'];
    given_name: IUser['firstName'];
    family_name: IUser['lastName'];
    picture: IUser['avatar'];
}

type Inputs = {
    firstName: IUser['firstName']
    email: IUser['email']
    password: string
}

const Auth: FC = () => {
    const { t } = useTranslation();

    const dispatch = useAppDispatch();

    const candidate = useAppSelector((state) => state.myUser.candidate);

    const {
        register,
        getValues,
        handleSubmit,
        formState: { errors },
    } = useForm<Inputs>({
        defaultValues: {
            firstName: candidate?.firstName || '',
            email: candidate?.email || '',
            password: '',
        }
    });

    const location = useLocation();

    const [ isRegistration, setIsRegistration ] = useState<boolean>(
        location.search === '?register' || location.search === '?agree'
    );
    const [ isForgotPassword, setIsForgotPassword ] = useState<boolean>(false);
    const [ clickedOnSubmit, setClickedOnSubmit ] = useState<boolean>(false);
    const [ repeatPassword, setRepeatPassword ] = useState<string>('');
    const [ repeatPasswordError, setRepeatPasswordError ] = useState<string>('');
    const [ checkedPrivacyPolicy, setCheckedPrivacyPolicy ] = useState<boolean>(location.search === '?agree');
    const [ checkedPrivacyPolicyError, setCheckedPrivacyPolicyError ] = useState<string>('');

    let title = t('auth-page.title.sing_in');
    isRegistration && (title = t('auth-page.title.sing_up'));
    isForgotPassword && (title = t('auth-page.title.forgot_password'));

    let submit = t('sing-in');
    isRegistration && (submit = t('sing-up'));
    isForgotPassword && (submit = t('auth-page.recovery'));

    const handleGoogleLogin = async (response: CredentialResponse) => {
        setClickedOnSubmit(true);

        if (checkedPrivacyPolicy) {
            setCheckedPrivacyPolicyError('');
        } else {
            return setCheckedPrivacyPolicyError(t('auth-page.privacy_policy_error'));
        }

        if (!response.credential || checkedPrivacyPolicyError.length > 0) return;

        const decodedUserData: IGoogleAuthCredentialResponse = jwtDecode(response.credential);

        await dispatch(googleAuthorization({
            email: decodedUserData.email,
            lang: getLang(),
            isActivated: decodedUserData.email_verified,
            firstName: decodedUserData.given_name,
            lastName: decodedUserData.family_name,
            avatar: decodedUserData.picture,
        }));
    };

    const onSubmit: SubmitHandler<Inputs> = async (data) => {
        setClickedOnSubmit(true);

        if (isForgotPassword) {
            return dispatch(forgotPassword({ email: data.email.trim(), lang: getLang() }));
        }

        if (isRegistration) {
            if (data.password === repeatPassword) {
                setRepeatPasswordError('');
            } else {
                return setRepeatPasswordError(t('auth-page.passwords_error'));
            }
        }

        if (checkedPrivacyPolicy) {
            setCheckedPrivacyPolicyError('');
        } else {
            return setCheckedPrivacyPolicyError(t('auth-page.privacy_policy_error'));
        }

        if (repeatPasswordError.length > 0 || checkedPrivacyPolicyError.length > 0) return;

        if (isRegistration && checkedPrivacyPolicy) {
            return dispatch(registration({ ...data, email: data.email.trim(), lang: getLang() }));
        }

        if (checkedPrivacyPolicy) {
            return dispatch(login({ ...data, email: data.email.trim(), lang: getLang() }));
        }
    };

    const repeatPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setRepeatPassword(value);

        if (!clickedOnSubmit) return;

        const password = getValues('password');
        password === value ? setRepeatPasswordError('') : setRepeatPasswordError(t('auth-page.passwords_error'));
    };

    const handleTogglePrivacyPolicy = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.checked;
        setCheckedPrivacyPolicy(value);

        if (!clickedOnSubmit) return;

        value
            ? setCheckedPrivacyPolicyError('')
            : setCheckedPrivacyPolicyError(t('auth-page.privacy_policy_error'));
    };

    return (
        <div className="auth-page">
            <div className="auth-title">
                <Logo to="/welcome" />

                <LanguageSelection />
            </div>

            <div className="box">
                <Card>
                    <div className="auth-title only-mobile">
                        <Logo to="/welcome" />

                        <LanguageSelection />
                    </div>

                    <form className="form" onSubmit={ handleSubmit(onSubmit) }>
                        <h1 className="title">
                            { title }
                        </h1>

                        { !isForgotPassword && (
                            <GoogleLogin
                                text={ isRegistration ? 'signup_with' : 'signin_with' }
                                onSuccess={ handleGoogleLogin }
                                onError={ () => {
                                    console.log('Google OAuth Login Failed');
                                    toast(t('alerts.auth-page.google-login.error'), { type: 'error' });
                                } }
                            />
                        ) }

                        <span className="auth-page-divider">{ t('auth-page.or') }</span>

                        { isRegistration && (
                            <Input
                                { ...register("firstName", accountFirstNameValidation) }
                                id="firstName"
                                name="firstName"
                                type="text"
                                label={ t('first-name') }
                                error={ errors?.firstName?.message }
                            />
                        ) }

                        <Input
                            { ...register("email", emailValidation) }
                            id="email"
                            name="email"
                            type="text"
                            label="Email*"
                            error={ errors?.email?.message }
                        />

                        { !isForgotPassword && (
                            <Input
                                { ...register("password", passwordValidation) }
                                id="password"
                                name="password"
                                type="password"
                                label={ t('auth-page.password') }
                                error={ errors?.password?.message }
                            />
                        ) }

                        { isRegistration && (
                            <Input
                                id="repeat-password"
                                name="repeat-password"
                                type="password"
                                label={ t('auth-page.repeat_password') }
                                value={ repeatPassword }
                                error={ repeatPasswordError }
                                onChange={ (event) => repeatPasswordChange(event as ChangeEvent<HTMLInputElement>) }
                            />
                        ) }

                        <div className="actions">
                            { !isForgotPassword && (
                                <Button
                                    type="button"
                                    variant="text"
                                    color="primary-color"
                                    onClick={ () => setIsRegistration((state) => !state) }
                                >
                                    { isRegistration ? t('sing-in') : t('sing-up') }
                                </Button>
                            ) }

                            { !isRegistration && (
                                <div className="forgot-password">
                                    <Button
                                        type="button"
                                        variant="text"
                                        color="action-color"
                                        onClick={ () => setIsForgotPassword((state) => !state) }
                                    >
                                        {
                                            isForgotPassword
                                                ? t('auth-page.password_remembered')
                                                : t('auth-page.forgot_password')
                                        }
                                    </Button>
                                </div>
                            ) }
                        </div>

                        { !isForgotPassword && (
                            <div className="auth-privacy-policy">
                                <Checkbox
                                    id="privacy-policy"
                                    name="privacy-policy"
                                    value="privacy-policy"
                                    checked={ checkedPrivacyPolicy }
                                    onChange={ handleTogglePrivacyPolicy }
                                >
                                    { t('auth-page.i_agree_to') }
                                    <Button to="/privacy-policy" variant="text" color="primary-color">
                                        { t('auth-page.privacy_policy') }
                                    </Button>
                                    { t('auth-page.wish_hub') }
                                </Checkbox>

                                { checkedPrivacyPolicyError.length > 0 && (
                                    <p className="error">{ checkedPrivacyPolicyError }</p>
                                ) }
                            </div>
                        ) }

                        <Button type="submit">{ submit }</Button>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default Auth;
