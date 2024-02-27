import React, { FC, useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Cancel as CancelIcon } from '@mui/icons-material';
import Button from '../components/Button';
import { useAppDispatch, useAppSelector } from '../store/hook';
import { createWish } from '../store/wishes/thunks';
import { ALLOWED_FILE_EXTENSIONS, ALLOWED_MAX_FILE_SIZE_IN_MB } from '../utils/constants';
import Input from './Input';
import { IImage, IWish } from '../models/IWish';
import StylesVariables from '../styles/utils/variables.module.scss';

interface IProps {
    idForEditing: IWish['id'] | null;
    close: () => void;
}

const acceptTypes: { [key: string]: string[] } = {};
Object.keys(ALLOWED_FILE_EXTENSIONS).forEach((ext) => {
    const mimeType = ALLOWED_FILE_EXTENSIONS[ext];
    if (!acceptTypes[mimeType]) {
        acceptTypes[mimeType] = [];
    }
    acceptTypes[mimeType].push(`.${ext}`);
});

const WishSettings: FC<IProps> = ({ idForEditing, close }) => {
    const [name, setName] = useState<string>('');
    const [price, setPrice] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [images, setImages] = useState<(File | null | IImage)[]>([]);

    const onDrop = useCallback((acceptedImages: File[]) => {
        setImages([...images, ...acceptedImages]);
    }, [images]);

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: acceptTypes,
        maxSize: ALLOWED_MAX_FILE_SIZE_IN_MB * 1024 * 1024,
    });

    const myUser = useAppSelector((state) => state.myUser.user);
    const wishList = useAppSelector((state) => state.wishes.list);

    const dispatch = useAppDispatch();

    const send = async () => {
        if (!myUser) return;

        await dispatch(createWish({ userId: myUser.id, name, price, description, images }));
        close();
    };

    const showImage = (image: File | null | IImage) => {
        if (image instanceof File) {
            return URL.createObjectURL(image);
        }

        return image?.path || '';
    };

    const removeImage = (image: File | null | IImage) => () => {
        const newImages = [...images];
        newImages.splice(newImages.indexOf(image), 1);
        setImages(newImages);
    };

    const removeAll = () => {
        setImages([]);
    };

    useEffect(() => {
        if (wishList.length === 0) return;

        const myWish = wishList.find((wish) => wish.id === idForEditing);
        if (!myWish) return;

        setName(myWish.name);
        setPrice(myWish.price);
        setDescription(myWish.description);
        setImages(myWish.images);
    }, [idForEditing, wishList]);

    return (
        <>
            <Input
                id="name"
                type="text"
                label="Назва твого бажання"
                title="Як ти назвеш своє бажання?" // TODO: const nameRegex = /^[a-zA-Zа-яА-Я0-9\s!"№#$%&'()*,-;=?@_]*$/;
                value={name}
                onChange={(e) => setName(e.target.value)}
            />

            <Input
                id="price"
                type="text"
                label="Ціна"
                title="Приблизна або точна ціна"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
            />

            <Input
                id="description"
                type="text"
                label="Опис бажання"
                title="Опиши своє бажання?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />

            <div className="drag-n-drop">
                <div {...getRootProps({ className: 'dropzone' })}>
                    <input {...getInputProps()} />
                    <p className="text">Перетягніть кілька зображень сюди або клацніть, щоб вибрати зображення</p>
                </div>
                <ul className="list">
                    {images.map((image, i) => {
                        if (!image) return null;

                        return (
                            <li className="item" key={`wish-image-${i}`}>
                                <img
                                    src={showImage(image)}
                                    alt={`wish-image-${i}`}
                                    loading="lazy"
                                />
                                <button className="remove" onClick={removeImage(image)}>
                                    <CancelIcon sx={{ color: StylesVariables.actionColor }} />
                                </button>
                            </li>
                        );
                    })}
                </ul>
                {images.length > 0 && <button className="remove-all" onClick={removeAll}>Remove All images</button>}
            </div>

            <Button onClick={send}>
                Зберегти
            </Button>
        </>
    );
};

export default WishSettings;
