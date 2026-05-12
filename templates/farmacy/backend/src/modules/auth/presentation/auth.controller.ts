import { RegisterDtoSchema, LoginDtoSchema, RefreshTokenDtoSchema } from './auth.dto.js';
import * as authService from '../application/auth.service.js';

const register = async (request: any, reply: any) => {
    const data = RegisterDtoSchema.parse(request.body);
    const result = await authService.register(data);
    return reply.status(201).send(result);
};

const login = async (request: any, reply: any) => {
    const data = LoginDtoSchema.parse(request.body);
    const result = await authService.login(data.email, data.password);

    reply.setCookie('access_token', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000,
    });

    reply.setCookie('refresh_token', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return reply.send({
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
    });
};

const refresh = async (request: any, reply: any) => {
    const data = RefreshTokenDtoSchema.parse(request.body);
    const result = await authService.refresh(data.refreshToken);

    reply.setCookie('access_token', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000,
    });

    reply.setCookie('refresh_token', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return reply.send(result);
};

const logout = async (request: any, reply: any) => {
    await authService.logout(request.user.sub);

    reply.clearCookie('access_token');
    reply.clearCookie('refresh_token');

    return reply.send({ message: 'Logged out successfully' });
};

export { register, login, refresh, logout };