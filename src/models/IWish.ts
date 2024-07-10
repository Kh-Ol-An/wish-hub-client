import { Dayjs } from 'dayjs';
import { IUser } from '@/models/IUser';

export interface IImage {
    id: string;
    path: string;
    position: number;
    delete?: boolean;
}

export type TCurrentImage = (File | IImage);

export interface IBooking {
    userId: IUser['id'];
    start: Dayjs;
    end: Dayjs;
}

interface IAddress {
    id: string;
    value: string;
}

interface ILike {
    userId: string;
    userAvatar: string;
    userFullName: string;
}

export interface IWish {
    id: string;
    userId: IUser['id'];
    material: boolean;
    show: 'all' | 'friends' | 'nobody';
    name: string;
    images: IImage[];
    price?: string;
    currency: 'UAH' | 'USD' | 'EUR';
    addresses?: IAddress[];
    description: string;
    executed: boolean;
    booking?: IBooking;
    likes: ILike[];
    dislikes: ILike[];
}
