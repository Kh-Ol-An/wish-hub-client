import { AppDispatch } from "@/store";
import { getAllWishes, getWishList } from "@/store/wishes/thunks";
import { setWishStatus, setWishesSearch, setWishesSort } from "@/store/wishes/slice";
import { selectUserId } from "@/store/selected-user/slice";
import { WISHES_PAGINATION_LIMIT } from "@/utils/constants";
import { EWishSort, EWishStatus } from "@/models/IWish";
import { IUser } from "@/models/IUser";

export const handleGetInitialAllWishes = async (dispatch: AppDispatch) => {
    await dispatch(getAllWishes({ page: 1, limit: WISHES_PAGINATION_LIMIT, search: '', sort: EWishSort.POPULAR }));
    await dispatch(setWishStatus(EWishStatus.ALL));
    await dispatch(setWishesSearch(''));
    await dispatch(setWishesSort(EWishSort.POPULAR));
    await dispatch(selectUserId(null));
    localStorage.removeItem('selectedUserId');
};

export const handleGetInitialWishList = async (dispatch: AppDispatch, myId: IUser['id'] | undefined, userId: IUser['id'], sort: EWishSort = EWishSort.POPULAR) => {
    await dispatch(getWishList({
        myId,
        userId,
        status: EWishStatus.ALL,
        page: 1,
        limit: WISHES_PAGINATION_LIMIT,
        search: '',
        sort,
    }));
    await dispatch(setWishStatus(EWishStatus.ALL));
    await dispatch(setWishesSearch(''));
    await dispatch(setWishesSort(sort));
    await dispatch(selectUserId(userId));
    localStorage.setItem('selectedUserId', userId);
};
