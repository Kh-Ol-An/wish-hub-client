import { Dayjs } from 'dayjs';

export interface IImage {
    id: string;
    path: string;
    position: number;
    delete?: boolean;
}

export type ICurrentImage = (File | IImage);

export interface IWish {
    id: string;
    user: string;
    material: boolean;
    show: 'all' | 'friends' | 'nobody';
    name: string;
    price?: string;
    address?: string;
    description: string;
    images: IImage[];
    createdAt: Dayjs;
    updatedAt: Dayjs;
}
