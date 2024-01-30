import { makeAutoObservable } from 'mobx';
import { toast } from 'react-toastify';
import AuthService from '../services/AuthService';
import { IUser } from '../models/IUser';
import UserService from '../services/UserService';

export default class Store {
    user = {} as IUser;
    users = [] as IUser[];
    isAuth = false;
    isLoading = false;

    constructor() {
        makeAutoObservable(this);
    }

    setUser(user: IUser) {
        this.user = user;
    }

    setUsers(users: IUser[]) {
        this.users = users;
    }

    setAuth(bool: boolean) {
        this.isAuth = bool;
    }

    setLoading(bool: boolean) {
        this.isLoading = bool;
    }

    async registration(email: string, password: string) {
        this.setLoading(true);
        try {
            const response = await AuthService.registration(email, password);

            localStorage.setItem('token', response.data.accessToken);
            this.setAuth(true);
            this.setUser(response.data.user);
        } catch (e: any) {
            toast(e.response?.data?.message || 'Не вдалось зареєструватися.', { type: 'error' });
        } finally {
            this.setLoading(false);
        }
    }

    async login(email: string, password: string) {
        this.setLoading(true);
        try {
            const response = await AuthService.login(email, password);

            localStorage.setItem('token', response.data.accessToken);
            this.setAuth(true);
            this.setUser(response.data.user);
        } catch (e: any) {
            toast(e.response?.data?.message || 'Не вдалось авторизуватись.', { type: 'error' });
        } finally {
            this.setLoading(false);
        }
    }

    async logout() {
        this.setLoading(true);
        try {
            await AuthService.logout();
            localStorage.removeItem('token');
            this.setAuth(false);
            this.setUser({} as IUser);
        } catch (e: any) {
            toast(e.response?.data?.message || 'Не вдалось вийти.', { type: 'error' });
        } finally {
            this.setLoading(false);
        }
    }

    async checkAuth() {
        this.setLoading(true);
        try {
            const response = await AuthService.refresh();

            localStorage.setItem('token', response.data.accessToken);
            this.setAuth(true);
            this.setUser(response.data.user);
        } catch (e: any) {
            toast(e.response?.data?.message || 'Не вдалось оновити сесію.', { type: 'error' });
        } finally {
            this.setLoading(false);
        }
    }

    async getUsers() {
        this.setLoading(true);
        try {
            const response = await UserService.fetchUsers();

            this.setUsers(response.data);
        } catch (e: any) {
            toast(e.response?.data?.message || 'Не вдалось отримати всіх юзерів.', { type: 'error' });
        } finally {
            this.setLoading(false);
        }
    }
}
