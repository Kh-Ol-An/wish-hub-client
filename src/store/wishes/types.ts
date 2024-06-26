import { TCurrentImage, IWish } from '@/models/IWish';
import { IUser } from '@/models/IUser';
import { IQuote } from "@/models/IQuote";

export interface ICreateWish {
    userId: IUser['id'];
    material: IWish['material'];
    show: IWish['show'];
    currency?: IWish['currency'] | string;
    name: IWish['name'];
    price?: IWish['price'];
    addresses?: IWish['addresses'];
    description?: IWish['description'];
    images: TCurrentImage[];
}

export interface IWishWithQuote {
    wish: IWish;
    quote: IQuote;
}

export interface IUpdateWish extends ICreateWish {
    id: IWish['id'];
}

export interface ISendWish {
    wishId: IWish['id'];
}

export interface ISendWishList {
    myId: IUser['id'];
    userId: IUser['id'];
}

export interface IGetWish {
    userFirstName: IUser['firstName'];
    userLastName: IUser['lastName'];
    userAvatar: IUser['avatar'],
    wish: IWish;
}

export interface IActionWish {
    userId: IUser['id'];
    wishId: IWish['id'];
}

export interface IDoneWish extends IActionWish{
    whoseWish: 'my' | 'someone';
}

export interface IBookWish extends IActionWish {
    end: string;
}
