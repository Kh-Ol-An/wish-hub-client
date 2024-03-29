import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/store/wishes/api';
import { IBookWish, IActionWish, ICreateWish, IGetWish, IUpdateWish } from '@/store/wishes/types';
import { IUser } from '@/models/IUser';
import { IWish } from '@/models/IWish';

export const createWish = createAsyncThunk<IWish, ICreateWish>(
    'wishes/createWish',
    async (data) => {
        const result = await api.createWish(data);

        return result.data;
    },
);

export const updateWish = createAsyncThunk<IWish, IUpdateWish>(
    'wishes/updateWish',
    async (data) => {
        const result = await api.updateWish(data);

        return result.data;
    },
);

export const deleteWish = createAsyncThunk<IWish['id'], [IUser['id'], IWish['id']]>(
    'wishes/deleteWish',
    async ([userId, wishId]) => {
        const result = await api.deleteWish(userId, wishId);

        return result.data;
    },
);

export const getWishList = createAsyncThunk<IWish[], IGetWish>(
    'wishes/getWishList',
    async (params) => {
        const result = await api.getWishList(params);

        return result.data;
    },
);

export const bookWish = createAsyncThunk<IWish, IBookWish>(
    'wishes/bookWish',
    async (data) => {
        const result = await api.bookWish(data);

        return result.data;
    },
);

export const cancelBookWish = createAsyncThunk<IWish, IActionWish>(
    'wishes/cancelBookWish',
    async (data) => {
        const result = await api.cancelBookWish(data);

        return result.data;
    },
);

export const doneWish = createAsyncThunk<{ executorUser: IUser, bookedWish: IWish }, IActionWish>(
    'wishes/doneWish',
    async (data) => {
        const result = await api.doneWish(data);

        return result.data;
    },
);

export const undoneWish = createAsyncThunk<{ executorUser: IUser, bookedWish: IWish }, IActionWish>(
    'wishes/undoneWish',
    async (data) => {
        const result = await api.undoneWish(data);

        return result.data;
    },
);
