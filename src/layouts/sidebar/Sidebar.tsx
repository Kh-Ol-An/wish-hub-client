import React, { FC, useState, useRef, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { useTranslation } from 'react-i18next';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { addAllUsers, addUsers, getAllUsers, getUsers } from '@/store/users/thunks';
import { EUserType, ISendUsersParams } from '@/store/users/types';
import Loading from '@/layouts/Loading';
import UserAction from '@/layouts/sidebar/UserAction';
import Search from '@/components/Search';
import ShareButton from '@/components/ShareButton';
import { USERS_PAGINATION_LIMIT } from '@/utils/constants';
import StylesVariables from '@/styles/utils/variables.module.scss';
import { setUsersSearch } from '@/store/users/slice';

interface IProps {
    showSidebar: boolean;
    hideSidebar: () => void;
}

const Sidebar: FC<IProps> = ({ showSidebar, hideSidebar }) => {
    const { t } = useTranslation();

    const { ref, inView } = useInView({
        threshold: 0,
    });

    const myUser = useAppSelector((state) => state.myUser.user);
    const users = useAppSelector((state) => state.users);

    const dispatch = useAppDispatch();

    const [ firstLoad, setFirstLoad ] = useState<boolean>(true);
    const [ userType, setUserType ] = useState<ISendUsersParams['userType']>(EUserType.ALL);

    const userListRef = useRef<HTMLDivElement>(null);

    const handleChangeUserType = (event: SelectChangeEvent) => {
        const value = event.target.value as ISendUsersParams['userType'];
        setUserType(value);

        if (!myUser || !userListRef.current) return;

        userListRef.current.scrollTo(0, 0);

        dispatch(getUsers({
            page: 1,
            limit: USERS_PAGINATION_LIMIT,
            myUserId: myUser.id,
            userType: value,
            search: users.search
        }));
    };

    const handleChangeSearchBar = async (value: string) => {
        await dispatch(setUsersSearch(value));

        if (!userListRef.current) return;

        userListRef.current.scrollTo(0, 0);

        if (!myUser) {
            dispatch(getAllUsers({ page: 1, limit: USERS_PAGINATION_LIMIT, search: value }));
        } else {
            dispatch(getUsers({
                page: 1,
                limit: USERS_PAGINATION_LIMIT,
                myUserId: myUser.id,
                userType,
                search: value
            }));
        }
    };

    const updateUsers = () => {
        if (!myUser) return;

        dispatch(getUsers({
            page: 1,
            limit: USERS_PAGINATION_LIMIT,
            myUserId: myUser.id,
            userType,
            search: users.search
        }));

        if (!userListRef.current) return;

        userListRef.current.scrollTo(0, 0);
    };

    useEffect(() => {
        if (firstLoad) {
            setFirstLoad(false);
            return;
        }

        if (!inView || users.stopRequests) return;
        if (myUser) {
            dispatch(addUsers({
                page: users.page,
                limit: USERS_PAGINATION_LIMIT,
                myUserId: myUser.id,
                userType,
                search: users.search,
            }));
        } else {
            dispatch(addAllUsers({ page: users.page, limit: USERS_PAGINATION_LIMIT, search: users.search }));
        }
    }, [ inView ]);

    useEffect(() => {
        if (myUser) {
            dispatch(getUsers({
                page: 1,
                limit: USERS_PAGINATION_LIMIT,
                myUserId: myUser.id,
                userType,
                search: users.search,
            }));
        } else {
            dispatch(getAllUsers({ page: 1, limit: USERS_PAGINATION_LIMIT, search: users.search }));
        }
    }, []);

    return (
        <div className={ "sidebar" + (showSidebar ? " show" : "") }>
            <div className="sidebar-inner">
                <div className="sidebar-content">
                    <div className="sidebar-head">
                        <h2 className="sidebar-title">{ t('main-page.users') }</h2>

                        <ShareButton link="welcome" />
                    </div>

                    { myUser && (
                        <div className="custom-mui-select">
                            <div className="select-box">
                                <Select
                                    id="sidebar-user-type"
                                    variant="standard"
                                    sx={ { padding: '0 10px', color: StylesVariables.primaryColor } }
                                    value={ userType }
                                    onChange={ handleChangeUserType }
                                >
                                    <MenuItem value="all">{ t('main-page.all') }</MenuItem>
                                    <MenuItem value="friends">{ t('main-page.friends') }</MenuItem>
                                    <MenuItem value="followFrom">
                                    <span className="sidebar-user-type-item">
                                        { t('main-page.friend-requests') }
                                        { users.followFromCount > 0 && (
                                            <span className="count">{ users.followFromCount }</span>
                                        ) }
                                    </span>
                                    </MenuItem>
                                    <MenuItem value="followTo">{ t('main-page.sent-friend-requests') }</MenuItem>
                                </Select>

                                { users.followFromCount > 0 && (
                                    <span className="count">{ users.followFromCount }</span>
                                ) }
                            </div>
                        </div>
                    ) }

                    <div className="sidebar-search">
                        <Search
                            id="user-search"
                            label={ t('main-page.users-search') }
                            changeSearchBar={ handleChangeSearchBar }
                        />
                    </div>

                    <div className={ "user-list" + (myUser === null ? ' without-select' : '') } ref={ userListRef }>
                        <ul className="list">
                            { users.list.map(user => (
                                <UserAction
                                    key={ user.id }
                                    user={ user }
                                    updateUsers={ updateUsers }
                                    hideSidebar={ hideSidebar }
                                />
                            )) }
                        </ul>

                        <div
                            className="observable-element"
                            style={ { display: users.stopRequests ? 'none' : 'block' } }
                            ref={ ref }
                        ></div>

                        { users.isLoading && <Loading isLocal /> }
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
