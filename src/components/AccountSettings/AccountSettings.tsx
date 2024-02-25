import React, { FC, useState, useEffect } from 'react';
import { FormControl, InputLabel, OutlinedInput } from '@mui/material';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { AvatarBox, AvatarImg, FileInput } from './AccountSettingsStyles';
import Button from '../../components/Button';
import { useAppDispatch, useAppSelector } from '../../store/hook';
import { updateMyUser } from '../../store/my-user/thunks';
import { ALLOWED_FILE_EXTENSIONS } from '../../utils/constants';

interface IProps {
    close: () => void;
}

const AccountSettings: FC<IProps> = ({ close }) => {
    const [name, setName] = useState<string>('');
    const [avatar, setAvatar] = useState<File | null | string>('');
    const [birthday, setBirthday] = useState<Dayjs | null>(null);

    const myUser = useAppSelector((state) => state.myUser);

    const dispatch = useAppDispatch();

    const send = async () => {
        if (!myUser.user || !birthday) return;

        await dispatch(updateMyUser({ id: myUser.user.id, name, birthday: birthday.format(), avatar }));
        close();
    };

    const removeAvatar = () => {
        setAvatar(null);
    };

    const showAvatar = () => {
        if (avatar instanceof File) {
            return URL.createObjectURL(avatar);
        }

        return avatar || '';
    };

    useEffect(() => {
        if (!myUser.user) return;

        setName(myUser.user.name);
        setAvatar(myUser.user.avatar || '');
        myUser.user.birthday && setBirthday(dayjs(myUser.user.birthday));
    }, [myUser]);

    return (
        <>
            <FormControl
                sx={{ width: '100%' }}
                variant="outlined"
                size="small"
                title="Якє в тебе ім'я?"
            >
                <InputLabel htmlFor="name">Ім'я</InputLabel>
                <OutlinedInput
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    label="Ім'я"
                />
            </FormControl>

            <AvatarBox>
                <label htmlFor="avatar">
                    <FileInput
                        id="avatar"
                        accept={Object.values(ALLOWED_FILE_EXTENSIONS).join(",")} // TODO: check
                        type="file"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            setAvatar(file);
                        }}
                    />
                    <AvatarImg src={showAvatar()} alt={myUser.user?.name} />
                </label>

                <Button onClick={removeAvatar}>
                    removeAvatar
                </Button>
            </AvatarBox>

            <div title="Коли твій день народженя?">
                <DemoContainer components={['DatePicker']}>
                    <DatePicker
                        label="День Народженя"
                        format="DD.MM.YYYY"
                        value={birthday}
                        onChange={(value) => setBirthday(value)}
                    />
                </DemoContainer>
            </div>

            <Button disabled={!birthday} onClick={send}>
                Зберегти
            </Button>
        </>
    );
};

export default AccountSettings;
