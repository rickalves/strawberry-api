import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RecoverDto as RecoverPasswordDto } from './dto/recover.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import type { Response } from 'express';
import type { User } from '@supabase/supabase-js';

type MockedAuthService = jest.Mocked<{
  register: (dto: RegisterDto) => Promise<any>;
  login: (dto: LoginDto) => Promise<{ user: User | null; session: any }>;
  loginWithGoogle: () => Promise<{ url?: string } | null>;
  recoverPassword: (email: string) => Promise<{ message: string }>;
  updatePassword: (dto: UpdatePasswordDto) => Promise<{ message: string }>;
  logout: () => Promise<{ message: string }>;
}>;

describe('AuthController (comprehensive)', () => {
  let controller: AuthController;
  let service: MockedAuthService;

  beforeEach(async () => {
    const serviceMock = {
      register: jest.fn(),
      login: jest.fn(),
      loginWithGoogle: jest.fn(),
      recoverPassword: jest.fn(),
      updatePassword: jest.fn(),
      logout: jest.fn(),
    } as unknown as MockedAuthService;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: serviceMock }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<MockedAuthService>(AuthService);
  });

  it('register -> delegates to service.register', async () => {
    const dto: RegisterDto = {
      fullName: 'Test User',
      email: 't@example.com',
      password: 'p',
    };
    service.register.mockResolvedValue({ id: 'u1' });
    const result = await controller.register(dto);
    expect(service.register).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ id: 'u1' });
  });

  it('login -> sets headers and returns user', async () => {
    const dto: LoginDto = { email: 'a@b.com', password: 'p' };
    const user = {
      id: 'u1',
      email: dto.email,
    } as unknown as User;
    const session = { access_token: 'at', refresh_token: 'rt' };
    service.login.mockResolvedValue({ user, session });

    const setHeader = jest.fn();
    const res = { setHeader } as unknown as Response;

    const result = await controller.login(dto, res);

    expect(service.login).toHaveBeenCalledWith(dto);
    expect(setHeader).toHaveBeenCalledWith(
      'Authorization',
      `Bearer ${session.access_token}`,
    );
    expect(setHeader).toHaveBeenCalledWith(
      'x-refresh-token',
      session.refresh_token,
    );
    expect(result).toEqual({ user });
  });

  it('loginGoogle -> returns url or throws on missing url', async () => {
    service.loginWithGoogle.mockResolvedValue({ url: 'http://example.com' });
    const result = await controller.loginGoogle();
    expect(service.loginWithGoogle).toHaveBeenCalled();
    expect(result).toEqual({ url: 'http://example.com' });

    service.loginWithGoogle.mockResolvedValue(null);
    await expect(controller.loginGoogle()).rejects.toThrow();
  });

  it('getProfile -> returns user or throws if missing', () => {
    const user = {
      id: 'u1',
    } as unknown as User;
    expect(controller.getProfile(user)).toEqual(user);
    expect(() => controller.getProfile(null as unknown as User)).toThrow();
  });

  it('recoverPassword -> delegates to service.recoverPassword', async () => {
    const dto: RecoverPasswordDto = { email: 'a@b.com' } as RecoverPasswordDto;
    service.recoverPassword.mockResolvedValue({ message: 'ok' });
    const result = await controller.recoverPassword(dto);
    expect(service.recoverPassword).toHaveBeenCalledWith(dto.email);
    expect(result).toEqual({ message: 'ok' });
  });

  it('updatePassword -> delegates to service.updatePassword', async () => {
    const dto: UpdatePasswordDto = {
      token: 't',
      newPassword: 'newpass',
    } as unknown as UpdatePasswordDto;
    service.updatePassword.mockResolvedValue({ message: 'ok' });
    const result = await controller.updatePassword(dto);
    expect(service.updatePassword).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ message: 'ok' });
  });

  it('logout -> delegates to service.logout', async () => {
    service.logout.mockResolvedValue({ message: 'ok' });
    const result = await controller.logout();
    expect(service.logout).toHaveBeenCalled();
    expect(result).toEqual({ message: 'ok' });
  });

  it('should return user metadata', () => {
    const user = {
      id: 'u1',
      app_metadata: { role: 'admin' },
    } as unknown as User;
    const result = controller.testUser(user);
    expect(result).toMatchObject({ ok: true, uid: 'u1', role: 'admin' });
  });
});
