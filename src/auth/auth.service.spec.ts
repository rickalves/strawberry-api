/*
 Teste unitário mínimo para AuthService.  Adicione mais testes conforme necessário.
 Dependências externas são simuladas para isolar o serviço.
*/
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { SUPABASE_CLIENT } from './supabase-client.provider';
import { SUPABASE_ADMIN_CLIENT } from './supabase-admin.provider';
import { Session, User } from '@supabase/supabase-js';

// Tipos simulados para o cliente Supabase
type MockedAuth = {
  signUp: jest.Mock;
  signInWithPassword: jest.Mock;
  getUser: jest.Mock;
};

type MockedAuthAdmin = {
  createUser: jest.Mock;
  updateUserById: jest.Mock;
};

// Tipo simulado para o cliente Supabase completo
type MockedSupabase = {
  auth: MockedAuth;
};

type MockedSupabaseAdmin = {
  auth: {
    admin: MockedAuthAdmin;
  };
};
// Função auxiliar para criar um cliente Supabase simulado
function makeMockSupabase(): MockedSupabase {
  return {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      getUser: jest.fn(),
    },
  };
}

function makeMockSupabaseAdmin(): MockedSupabaseAdmin {
  return {
    auth: {
      admin: {
        createUser: jest.fn(),
        updateUserById: jest.fn(),
      },
    },
  };
}

describe('AuthService', () => {
  let service: AuthService;
  let supabase: MockedSupabase;
  let supabaseAdmin: MockedSupabaseAdmin;

  const exampleUser = { id: 'u1', email: 'u@example.com' } as User;
  const exampleSession = { access_token: 'a1' } as Session;

  beforeEach(async () => {
    // Crie instâncias simuladas do Supabase
    supabase = makeMockSupabase();
    supabaseAdmin = makeMockSupabaseAdmin();

    // Configure o módulo de teste do NestJS
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: SUPABASE_CLIENT, useValue: supabase },
        { provide: SUPABASE_ADMIN_CLIENT, useValue: supabaseAdmin },
      ],
    }).compile();

    // Obtenha a instância do serviço a ser testado
    service = module.get<AuthService>(AuthService);
  });

  // Limpe os mocks após cada teste
  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should register a user and create a session', async () => {
    supabase.auth.signUp.mockResolvedValue({
      data: { user: exampleUser, session: exampleSession },
      error: null,
    });
    const result = await service.register({
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });

    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
      options: {
        data: { fullName: 'Test User', role: 'user' },
        emailRedirectTo: process.env.APP_CALLBACK_URL,
      },
    });

    expect(result).toEqual({ user: exampleUser, session: exampleSession });
  });

  // Teste de login
  it('should login a user and return session', async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: exampleUser, session: exampleSession },
      error: null,
    });
    const result = await service.login({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(result).toEqual({ user: exampleUser, session: exampleSession });
  });
  // Teste de login com falha
  it('should throw UnauthorizedException for invalid login credentials', async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { status: 400, message: 'E‑mail ou senha inválidos' },
    });
    await expect(
      service.login({ email: 'test@example.com', password: 'wrongpassword' }),
    ).rejects.toThrow('E‑mail ou senha inválidos');
  });

  // Teste de obtenção de usuário por token
  it('should get user by token', async () => {
    supabase.auth.getUser.mockResolvedValue({
      data: { user: exampleUser },
      error: null,
    });
    const result = await service.getUser('access-token-123');
    expect(supabase.auth.getUser).toHaveBeenCalledWith('access-token-123');
    expect(result).toEqual(exampleUser);
  });
  // Teste de falha na obtenção de usuário por token
  it('should throw Error when getUser fails', async () => {
    supabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Unexpected error retrieving user' },
    });
    await expect(service.getUser('invalid-token')).rejects.toThrow(
      'Unexpected error retrieving user',
    );
  });
  // Teste de criação de usuário admin
  it('should create a new user (admin)', async () => {
    const mockUser = { id: '123', email: 'test@example.com' };
    supabaseAdmin.auth.admin.createUser.mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    });

    const params = {
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Test User',
      role: 'admin' as const,
      emailConfirm: true,
    };

    const result = await service.adminCreateUser(params);

    expect(supabaseAdmin.auth.admin.createUser).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
      email_confirm: true,
      app_metadata: { role: 'admin' },
      user_metadata: { full_name: 'Test User' },
    });
    expect(result).toEqual(mockUser);
  });
  // Teste de definição de função para usuário existente
  it('should set a role for an existing user (admin)', async () => {
    const mockUser = { id: '123', email: 'test@example.com' };
    supabaseAdmin.auth.admin.updateUserById.mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    });

    const userId = '123';
    const role = 'manager';

    const result = await service.setRole(userId, role);
    expect(supabaseAdmin.auth.admin.updateUserById).toHaveBeenCalledWith(
      userId,
      {
        app_metadata: { role },
      },
    );
    expect(result).toEqual(mockUser);
  });
});
