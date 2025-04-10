'use client';

import React, { useState, useEffect } from 'react';
import { authService, userService } from '@/services/api';

type User = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

export default function UserInfo() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const fetchUserData = async (useNoCors = false, useProxy = false) => {
    try {
      setLoading(true);
      setError(null);
      setConnectionStatus(null);
      
      // Primeiro, tentar obter informações do localStorage
      const storedUser = localStorage.getItem('user');
      const userId = localStorage.getItem('userId');
      
      let storedName = '';
      let storedEmail = '';
      
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        storedName = userData.name;
        storedEmail = userData.email;
      }
      
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }
      
      if (useProxy) {
        console.log('UserInfo: Tentando buscar dados do usuário via proxy CORS');
        
        const corsProxyUrl = `https://cors-anywhere.herokuapp.com/${process.env.NEXT_PUBLIC_API_URL || 'https://truemetrics-n8n-n8n.b5glig.easypanel.host'}/webhook/getUserById?userId=${userId}`;
        const response = await fetch(corsProxyUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Origin': window.location.origin,
          },
        });
        
        if (!response.ok) {
          throw new Error(`Erro na requisição: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('UserInfo: Dados do usuário recebidos via proxy CORS:', data);
        
        if (data && typeof data === 'object') {
          const userData = Array.isArray(data) ? data[0] : data;
          setUser({
            id: userData.id || userId,
            name: userData.name || storedName || 'Usuário',
            email: userData.email || storedEmail || '',
            createdAt: userData.createdAt || new Date().toISOString(),
            updatedAt: userData.updatedAt || new Date().toISOString()
          });
          setLoading(false);
          return;
        }
      } else {
        console.log('UserInfo: Tentando buscar dados do usuário via API');
        const userData = await authService.getUserById(userId);
        if (!userData) {
          throw new Error('Não foi possível carregar os dados do usuário');
        }
        
        setUser(userData);
        setLoading(false);
      }
    } catch (err) {
      console.error('UserInfo: Erro ao carregar dados do usuário:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados do usuário');
      setLoading(false);
      
      // Tentar novamente se não atingiu o número máximo de tentativas
      if (retryCount < maxRetries) {
        console.log(`UserInfo: Tentativa ${retryCount + 1} de ${maxRetries}`);
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          fetchUserData(useNoCors, useProxy);
        }, 2000); // Esperar 2 segundos antes de tentar novamente
      }
    }
  };

  const testConnection = async (useAuth: boolean) => {
    try {
      setConnectionStatus('Testando conexão...');
      const result = await userService.testConnection(useAuth);
      
      if (result) {
        setConnectionStatus('Conexão bem-sucedida');
        console.log('UserInfo: Teste de conexão bem-sucedido');
      } else {
        setConnectionStatus('Falha na conexão');
        console.error('UserInfo: Falha no teste de conexão');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setConnectionStatus(`Erro ao testar conexão: ${errorMessage}`);
      console.error('UserInfo: Erro ao testar conexão:', err);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
        
        <div className="mt-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Teste de Conexão</h3>
          <div className="flex flex-wrap gap-2">
            {/* Botões de teste de conexão comentados
            <button
              onClick={() => testConnection(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Testar Conexão Normal
            </button>
            <button
              onClick={() => testConnection(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Testar com No-CORS
            </button>
            <button
              onClick={() => testConnection(false)}
              className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
            >
              Testar Sem Auth
            </button>
            <button
              onClick={() => fetchUserData(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              Recarregar com No-CORS
            </button>
            <button
              onClick={() => fetchUserData(false, true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Recarregar com Proxy CORS
            </button>
            <button
              onClick={async () => {
                try {
                  setConnectionStatus('Testando conexão com proxy CORS...');
                  const userId = localStorage.getItem('userId');
                  if (!userId) {
                    setConnectionStatus('Usuário não autenticado');
                    return;
                  }
                  
                  const corsProxyUrl = `https://cors-anywhere.herokuapp.com/${process.env.NEXT_PUBLIC_API_URL || 'https://truemetrics-n8n-n8n.b5glig.easypanel.host'}/webhook/getUserById?userId=${userId}`;
                  const response = await fetch(corsProxyUrl, {
                    method: 'GET',
                    headers: {
                      'Content-Type': 'application/json',
                      'Origin': window.location.origin,
                    },
                  });
                  
                  if (response.ok) {
                    const data = await response.json();
                    setConnectionStatus(`Conexão bem-sucedida via proxy CORS: ${JSON.stringify(data).substring(0, 100)}...`);
                    console.log('UserInfo: Teste de conexão com proxy CORS bem-sucedido:', data);
                  } else {
                    setConnectionStatus(`Falha na conexão via proxy CORS: ${response.status}`);
                    console.error('UserInfo: Falha no teste de conexão com proxy CORS:', response.status);
                  }
                } catch (err) {
                  const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
                  setConnectionStatus(`Erro ao testar conexão com proxy CORS: ${errorMessage}`);
                  console.error('UserInfo: Erro ao testar conexão com proxy CORS:', err);
                }
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Testar com Proxy CORS
            </button>
            */}
          </div>
          {connectionStatus && (
            <div className="mt-2 p-2 bg-gray-100 rounded">
              <p className="text-sm">{connectionStatus}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Informações do Usuário</h2>
      
      {user ? (
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-500">Nome</p>
            <p className="font-medium">{user.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium">{user.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">ID</p>
            <p className="font-medium">{user.id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Criado em</p>
            <p className="font-medium">{formatDate(user.createdAt)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Atualizado em</p>
            <p className="font-medium">{formatDate(user.updatedAt)}</p>
          </div>
        </div>
      ) : (
        <p className="text-gray-500">Nenhuma informação do usuário disponível.</p>
      )}
    </div>
  );
} 