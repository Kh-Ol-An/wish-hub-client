import React, { FC, useState } from 'react';
import i18next from "i18next";
import { UA, US } from 'country-flag-icons/react/3x2';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { changeLang } from '@/store/my-user/thunks';
import { setIsLoading } from '@/store/my-user/slice';
import { IUser } from '@/models/IUser';
import CustomSelect, { IOption } from "@/components/CustomSelect";

const options: IOption[] = [
    {
        label: (
            <>
                <US title="United States" className="flag-icon" />
                <span className="lang-text">Eng</span>
            </>
        ),
        value: 'en',
    },
    {
        label: (
            <>
                <UA title="Ukraine" className="flag-icon"/>
                <span className="lang-text">Укр</span>
            </>
        ),
        value: 'uk',
    },
];

const LanguageSelection: FC = () => {
    const myUser = useAppSelector((state) => state.myUser);

    const dispatch = useAppDispatch();

    let currentLang: IUser['lang'] = 'en';
    i18next.language.includes('en') && (currentLang = 'en');
    i18next.language.includes('uk') && (currentLang = 'uk');
    const [lang, setLang] = useState<IUser['lang']>(currentLang);

    const handleChangeLanguage = async (value: IOption['value']) => {
        try {
            await i18next.changeLanguage(value);
            setLang(value as IUser['lang']);

            if (myUser.user !== null) {
                await dispatch(changeLang({ userId: myUser.user.id, lang: value as IUser['lang'] }));
                await dispatch(setIsLoading(true));
                location.reload();
            }
        } catch (error) {
            console.error('Language Selection: ', error);
        }
    };

    return (
        <div className="language-selection">
            <CustomSelect
                options={options}
                value={lang}
                onChange={handleChangeLanguage}
            />
        </div>
    );
};

export default LanguageSelection;
