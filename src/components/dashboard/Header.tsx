'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { authService, userService } from '@/services/api';
import Link from 'next/link';

interface UserInfo {
  name: string;
  email: string;
}

export default function Header({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo>({ name: '', email: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedName = localStorage.getItem('userName');
      const storedEmail = localStorage.getItem('userEmail');
      
      if (storedName && storedEmail) {
        setUserInfo({
          name: storedName,
          email: storedEmail
        });
      }
    }
  }, []);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Obter o ID do usuário do localStorage
        const userId = localStorage.getItem('userId');
        const storedName = localStorage.getItem('userName');
        const storedEmail = localStorage.getItem('userEmail');
        
        if (!userId) {
          if (storedName && storedEmail) {
            setUserInfo({
              name: storedName,
              email: storedEmail
            });
          }
          setIsLoading(false);
          return;
        }
        
        // Buscar informações do usuário usando o userService
        try {
          const userData = await userService.getUserById(userId);
          
          if (userData) {
            const updatedUserInfo = {
              name: userData.name,
              email: userData.email
            };
            
            setUserInfo(updatedUserInfo);
            
            // Atualizar localStorage
            localStorage.setItem('userName', updatedUserInfo.name);
            localStorage.setItem('userEmail', updatedUserInfo.email);
          }
        } catch (apiError) {
          console.error('Erro ao buscar dados do usuário via userService:', apiError);
          
          // Usar dados do localStorage como fallback
          if (storedName && storedEmail) {
            setUserInfo({
              name: storedName,
              email: storedEmail
            });
          } else {
            setError('Erro ao carregar informações do usuário');
          }
        }
      } catch (error) {
        console.error('Erro ao buscar informações do usuário:', error);
        setError(error instanceof Error ? error.message : 'Erro ao carregar informações do usuário');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      // Usar o serviço de autenticação para fazer logout
      authService.logout();
      
      // Limpar todos os dados do usuário do localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('user');
      
      // Redirecionar para a página de login
      router.push('/login');
    }
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

  const handleToggleSidebar = () => {
    console.log('Header: Toggle sidebar button clicked');
    if (onToggleSidebar) {
      onToggleSidebar();
    }
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {onToggleSidebar && (
              <button
                onClick={handleToggleSidebar}
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
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin"></div>
                  ) : (
                    <span className="text-indigo-600 font-medium">{getUserInitial()}</span>
                  )}
                </div>
              </button>
              {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-1 z-10">
                  <div className="px-4 py-3 border-b">
                    <p className="text-sm font-medium text-gray-900">{userInfo.name}</p>
                    <p className="text-sm text-gray-500 truncate">{userInfo.email}</p>
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