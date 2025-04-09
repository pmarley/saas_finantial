'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { authService, userService } from '@/services/api';

interface UserInfo {
  name: string;
  email: string;
}

export default function Header({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: 'Usuário',
    email: 'usuario@exemplo.com'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Primeiro, tentar obter informações do localStorage
        const storedName = localStorage.getItem('userName');
        const storedEmail = localStorage.getItem('userEmail');
        const userId = localStorage.getItem('userId');
        
        // Definir valores padrão
        const defaultUserInfo = {
          name: 'Usuário',
          email: 'usuario@exemplo.com'
        };
        
        // Se tiver dados no localStorage, usar eles
        if (storedName && storedEmail) {
          console.log('Header: Usando informações do localStorage');
          setUserInfo({
            name: storedName,
            email: storedEmail
          });
        } else {
          // Se não tiver no localStorage, usar valores padrão
          setUserInfo(defaultUserInfo);
        }
        
        // Se tiver userId, tentar buscar dados atualizados da API
        if (userId) {
          console.log('Header: Buscando informações do usuário da API');
          try {
            const userData = await authService.getUserById(userId);
            
            if (userData?.name) {
              console.log('Header: Informações do usuário obtidas com sucesso');
              const updatedUserInfo = {
                name: userData.name,
                email: userData.email || defaultUserInfo.email
              };
              
              setUserInfo(updatedUserInfo);
              
              // Atualizar localStorage
              localStorage.setItem('userName', updatedUserInfo.name);
              localStorage.setItem('userEmail', updatedUserInfo.email);
            }
          } catch (apiError) {
            console.error('Header: Erro ao buscar dados da API:', apiError);
            // Manter os dados do localStorage ou padrão que já foram definidos
          }
        } else {
          console.warn('Header: userId não encontrado no localStorage');
        }
      } catch (error) {
        console.error('Header: Erro ao buscar informações do usuário:', error);
        setError(error instanceof Error ? error.message : 'Erro ao carregar informações do usuário');
        
        // Em caso de erro, usar valores padrão
        setUserInfo({
          name: 'Usuário',
          email: 'usuario@exemplo.com'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  const handleLogout = () => {
    console.log('Header: Iniciando logout');
    authService.logout();
    console.log('Header: Redirecionando para a página inicial');
    window.location.href = '/';
  };

  const getPageTitle = () => {
    switch (pathname) {
      case '/dashboard':
        return 'Dashboard';
      case '/dashboard/transactions':
        return 'Transações';
      case '/dashboard/reports':
        return 'Relatórios';
      case '/dashboard/settings':
        return 'Configurações';
      default:
        return 'Dashboard';
    }
  };

  const getUserInitial = () => {
    if (!userInfo?.name) return 'U';
    return userInfo.name.charAt(0).toUpperCase();
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="mr-4 p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none"
                aria-label="Toggle sidebar"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
            <h1 className="text-2xl font-semibold text-gray-900">{getPageTitle()}</h1>
          </div>
          <div className="flex items-center">
            <div className="relative">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-3 focus:outline-none"
                aria-label="Menu do usuário"
              >
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                  ) : (
                    <span className="text-gray-600 font-medium">{getUserInitial()}</span>
                  )}
                </div>
              </button>
              {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  <div className="px-4 py-2 border-b">
                    <p className="text-sm font-medium text-gray-900">{userInfo.name}</p>
                    <p className="text-sm text-gray-500">{userInfo.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
} 