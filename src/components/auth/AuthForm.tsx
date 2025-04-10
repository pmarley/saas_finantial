'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/api';
import { AuthResponse, LoginCredentials, RegisterCredentials } from '@/types/auth';

interface AuthFormProps {
  mode?: 'login' | 'register';
}

export default function AuthForm({ mode = 'login' }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(mode === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Verificar se o usuário já está autenticado
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const userId = localStorage.getItem('userId');
        
        if (token && userId) {
          console.log('AuthForm: Usuário já autenticado, redirecionando para o dashboard');
          router.push('/dashboard');
        }
      } catch (err) {
        console.error('AuthForm: Erro ao verificar autenticação:', err);
      }
    };
    
    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      if (!email || !password) {
        throw new Error('Por favor, preencha todos os campos');
      }

      console.log(`AuthForm: Tentando ${isLogin ? 'login' : 'registro'} com email:`, email);
      
      if (isLogin) {
        const credentials: LoginCredentials = { email, password };
        const response = await authService.login(credentials);
        console.log('AuthForm: Resposta do login:', response);
        
        if (!response) {
          throw new Error('Não foi possível realizar o login. Tente novamente.');
        }

        if (!response.token) {
          throw new Error('Token de autenticação não recebido');
        }

        // Armazenar token
        localStorage.setItem('authToken', response.token);
        
        // Armazenar ID do usuário
        if (response.userId) {
          localStorage.setItem('userId', response.userId);
        } else {
          throw new Error('ID do usuário não recebido');
        }
        
        // Armazenar informações do usuário
        localStorage.setItem('userEmail', response.email || email);
        localStorage.setItem('userName', response.name || email.split('@')[0]);
        
        console.log('AuthForm: Login bem-sucedido, redirecionando...');
        setSuccessMessage('Login realizado com sucesso!');
        
        // Pequeno delay para mostrar a mensagem de sucesso
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 500);
      } else {
        if (!name) {
          throw new Error('Por favor, preencha seu nome');
        }

        if (password !== confirmPassword) {
          throw new Error('As senhas não coincidem');
        }

        if (password.length < 6) {
          throw new Error('A senha deve ter pelo menos 6 caracteres');
        }

        const credentials: RegisterCredentials = { email, password, name };
        const response = await authService.register(credentials);
        console.log('AuthForm: Resposta do registro:', response);
        
        if (!response) {
          throw new Error('Não foi possível realizar o registro. Tente novamente.');
        }

        // Armazenar token apenas se ele existir
        if (response.token) {
          localStorage.setItem('authToken', response.token);
        }
        
        // Armazenar ID do usuário
        if (response.userId) {
          localStorage.setItem('userId', response.userId);
        }
        
        // Armazenar informações do usuário
        localStorage.setItem('userEmail', response.email || email);
        localStorage.setItem('userName', response.name || name);
        
        console.log('AuthForm: Registro bem-sucedido, redirecionando...');
        setSuccessMessage('Registro realizado com sucesso!');
        
        // Pequeno delay para mostrar a mensagem de sucesso
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 500);
      }
    } catch (err) {
      console.error('AuthForm: Erro de autenticação:', err);
      let errorMessage = 'Ocorreu um erro ao processar sua solicitação';
      
      if (err instanceof Error) {
        if (isLogin) {
          if (err.message.includes('401')) {
            errorMessage = 'Email ou senha incorretos';
          } else if (err.message.includes('Network Error')) {
            errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
          } else {
            errorMessage = err.message;
          }
        } else {
          // Mensagens de erro específicas para registro
          if (err.message.includes('Network Error')) {
            errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
          } else if (err.message.includes('409')) {
            errorMessage = 'Este email já está cadastrado.';
          } else if (err.message.includes('400')) {
            errorMessage = 'Dados inválidos. Verifique as informações e tente novamente.';
          } else if (err.message.includes('Por favor, preencha') || 
                    err.message.includes('As senhas não coincidem') ||
                    err.message.includes('A senha deve ter')) {
            errorMessage = err.message;
          } else {
            errorMessage = 'Não foi possível realizar o registro. Tente novamente.';
          }
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccessMessage('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isLogin ? 'Entrar na sua conta' : 'Criar uma nova conta'}
          </h2>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {successMessage && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{successMessage}</p>
              </div>
            </div>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="sr-only">Nome completo</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            )}
            <div>
              <label htmlFor="email-address" className="sr-only">Endereço de email</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 ${isLogin ? 'rounded-t-md' : ''} focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Endereço de email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Senha</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isLogin ? "current-password" : "new-password"}
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 ${isLogin ? 'rounded-b-md' : ''} focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            {!isLogin && (
              <div>
                <label htmlFor="confirm-password" className="sr-only">Confirmar senha</label>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Confirmar senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                isLoading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              }`}
            >
              {isLoading ? (
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
              ) : null}
              {isLogin ? 'Entrar' : 'Registrar'}
            </button>
          </div>
        </form>
        
        <div className="text-center">
          <button
            type="button"
            onClick={toggleMode}
            className="text-sm text-indigo-600 hover:text-indigo-500"
            disabled={isLoading}
          >
            {isLogin ? 'Não tem uma conta? Registre-se' : 'Já tem uma conta? Entre'}
          </button>
        </div>
      </div>
    </div>
  );
} 