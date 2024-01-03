import { configureStore } from "@reduxjs/toolkit";
import { useAuthStore } from "../../src/hooks/useAuthStore";
import { authSlice } from "../../src/store";
import { initialState, notAuthenticatedState } from "../fixtures/authStates";
import { testUserCredentials } from "../fixtures/testUser";
import { renderHook, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { act } from "react-dom/test-utils";
import calendarApi from "../../src/api/calendarApi";

describe('Pruebas en useAuthStore', () => {

    beforeEach(() => localStorage.clear());

    const getMockStore = (initialState) => {
        return configureStore({
            reducer: {
                auth: authSlice.reducer
            },
            preloadedState: {
                auth: { ...initialState }
            }
        });
    }

    test('debe de regresar los valores por defecto', () => {
        const mockStore = getMockStore({
            ...initialState
        });
        const { result } = renderHook(() => useAuthStore(), {
            wrapper: ({ children }) => <Provider store={mockStore}>{children}</Provider>
        });

        expect(result.current).toEqual({
            status: 'checking',
            user: {},
            errorMessage: undefined,
            checkAuthToken: expect.any(Function),
            startLogin: expect.any(Function),
            startLogout: expect.any(Function),
            startRegister: expect.any(Function),
        });
    });

    test('startLogin debe de realizar el login correctamente', async () => {

        const mockStore = getMockStore({ ...notAuthenticatedState });
        const { result } = renderHook(() => useAuthStore(), {
            wrapper: ({ children }) => <Provider store={mockStore}>{children}</Provider>
        });

        await act(async () => {
            await result.current.startLogin(testUserCredentials);
        });

        const { errorMessage, status, user } = result.current;
        expect({ errorMessage, status, user }).toEqual({
            errorMessage: undefined,
            status: 'authenticated',
            user: { name: 'Test User', uid: '65936e6479b98e5f70ee255b' }
        });

        expect(localStorage.getItem('token')).toEqual(expect.any(String));
        expect(localStorage.getItem('token-init-date')).toEqual(expect.any(String));
    });

    test('startLogin debe de fallar la autenticaciòn', async () => {

        const mockStore = getMockStore({ ...notAuthenticatedState });
        const { result } = renderHook(() => useAuthStore(), {
            wrapper: ({ children }) => <Provider store={mockStore}>{children}</Provider>
        });

        await act(async () => {
            await result.current.startLogin({ email: 'mail@mail.com', password: 'asffd' });
        });

        const { errorMessage, status, user } = result.current;

        expect(localStorage.getItem('token')).toBe(null);

        expect({ errorMessage, status, user }).toEqual({
            errorMessage: 'Credenciales incorrectas',
            status: 'not-authenticated',
            user: {}
        });

        waitFor(
            () => expect(result.current.errorMessage).toBe(undefined)
        );
    });

    test('startRegister debe de crear un usuario', async () => {
        const newUser = { email: 'mail@mail.com', password: 'asffd', name: 'Test user2' };

        const mockStore = getMockStore({ ...notAuthenticatedState });
        const { result } = renderHook(() => useAuthStore(), {
            wrapper: ({ children }) => <Provider store={mockStore}>{children}</Provider>
        });

        const spy = jest.spyOn(calendarApi, 'post').mockReturnValue({
            data: {
                ok: true,
                uid: '12345',
                name: 'Test user2',
                token: 'sdhgsdfhfd'
            }
        });

        await act(async () => {
            await result.current.startRegister(newUser);
        });

        const { errorMessage, user, status } = result.current;

        expect({ errorMessage, user, status }).toEqual({
            errorMessage: undefined,
            user: { name: 'Test user2', uid: '12345' },
            status: 'authenticated'
        });

        spy.mockRestore();
    });

    test('startRegister debe de fallar la creaciòn', async () => {

        const mockStore = getMockStore({ ...notAuthenticatedState });
        const { result } = renderHook(() => useAuthStore(), {
            wrapper: ({ children }) => <Provider store={mockStore}>{children}</Provider>
        });

        await act(async () => {
            await result.current.startRegister(testUserCredentials);
        });
        const { errorMessage, user, status } = result.current;

        expect({ errorMessage, user, status }).toEqual({
            errorMessage: 'Un usuario existe con ese correo',
            user: {},
            status: 'not-authenticated'
        });
    });

    test('checkAuthToken debe de fallar si no hay token', async () => {
        const mockStore = getMockStore({ ...initialState });
        const { result } = renderHook(() => useAuthStore(), {
            wrapper: ({ children }) => <Provider store={mockStore}>{children}</Provider>
        });

        await act(async () => {
            await result.current.checkAuthToken();
        });

        const { errorMessage, user, status } = result.current;
        expect({ errorMessage, user, status }).toEqual({
            errorMessage: undefined,
            user: {},
            status: 'not-authenticated'
        });
    });

    test('checkAuthToken debe de autenticar el usuario si hay un token', async () => {
        const { data } = await calendarApi.post('/auth', testUserCredentials);
        localStorage.setItem('token', data.token);

        const mockStore = getMockStore({ ...initialState });
        const { result } = renderHook(() => useAuthStore(), {
            wrapper: ({ children }) => <Provider store={mockStore}>{children}</Provider>
        });

        await act(async () => {
            await result.current.checkAuthToken();
        });

        const { errorMessage, user, status } = result.current;
        expect({ errorMessage, user, status }).toEqual({
            errorMessage: undefined,
            user: { name: 'Test User', uid: '65936e6479b98e5f70ee255b' },
            status: 'authenticated'
        });
    });
});