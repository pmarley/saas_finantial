import axios, { AxiosRequestConfig } from 'axios';
import { Transaction } from '@/types/transaction';
import { AuthResponse, LoginCredentials, RegisterCredentials, User } from '@/types/auth';

const API_BASE_URL = '/api/proxy';

console.log('API Base URL:', API_BASE_URL);

// Base API configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

function getMockTransactions(): Transaction[] {
  console.log('MockData: Gerando transações mockadas');
  return [
    {
      id: '1',
      description: 'Salário',
      amount: 5000.00,
      date: new Date().toISOString(),
      type: 'income',
      category: 'Trabalho'
    },
    {
      id: '2',
      description: 'Aluguel',
      amount: 1500.00,
      date: new Date(Date.now() - 86400000).toISOString(), // ontem
      type: 'expense',
      category: 'Moradia'
    },
    {
      id: '3',
      description: 'Investimento em Ações',
      amount: 1000.00,
      date: new Date(Date.now() - 172800000).toISOString(), // 2 dias atrás
      type: 'investment',
      category: 'Investimentos'
    },
    {
      id: '4',
      description: 'Freelance',
      amount: 800.00,
      date: new Date(Date.now() - 259200000).toISOString(), // 3 dias atrás
      type: 'income',
      category: 'Trabalho'
    },
    {
      id: '5',
      description: 'Supermercado',
      amount: 350.00,
      date: new Date(Date.now() - 345600000).toISOString(), // 4 dias atrás
      type: 'expense',
      category: 'Alimentação'
    }
  ];
}

function getMockAuthResponse(): AuthResponse[] {
  console.log('MockData: Gerando resposta de autenticação mockada');
  return [{
    token: 'mock-token-123',
    userId: '1',
    email: 'usuario@exemplo.com',
    name: 'Usuário Mock'
  }];
}

function getMockData(endpoint: string): Transaction[] | AuthResponse[] {
  console.log('MockData: Gerando dados mockados para:', endpoint);
  
  if (endpoint === 'transactions/data') {
    const mockTransactions = getMockTransactions();
    console.log('MockData: Transações mockadas geradas:', mockTransactions);
    return mockTransactions;
  }

  if (endpoint === 'auth/login' || endpoint === 'auth/register') {
    const mockAuthResponse = getMockAuthResponse();
    console.log('MockData: Resposta de autenticação mockada gerada:', mockAuthResponse);
    return mockAuthResponse;
  }

  console.warn('MockData: Endpoint não reconhecido:', endpoint);
  return [];
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('Login attempt with email:', credentials.email);
      const response = await axios.post('https://truemetrics-n8n-n8n.b5glig.easypanel.host/webhook/auth/login', credentials);
      console.log('Raw login response:', response.data);
      
      // Se a resposta é um array, pegar o primeiro item
      const responseData = Array.isArray(response.data) ? response.data[0] : response.data;
      console.log('Processed login response:', responseData);
      
      if (!responseData || !responseData.userId) {
        console.error('Invalid login response:', responseData);
        throw new Error('Resposta de login inválida: ID do usuário não encontrado');
      }
      
      // Garantir que a resposta tenha o formato esperado
      const authResponse: AuthResponse = {
        token: responseData.token || '',
        userId: responseData.userId,
        name: responseData.name || credentials.email.split('@')[0],
        email: responseData.email || credentials.email
      };
      
      // Armazenar dados do usuário no localStorage
      localStorage.setItem('token', authResponse.token);
      localStorage.setItem('userId', authResponse.userId);
      localStorage.setItem('user', JSON.stringify({
        name: authResponse.name,
        email: authResponse.email
      }));
      
      console.log('Formatted login response:', authResponse);
      return authResponse;
    } catch (error) {
      console.error('Login error:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Email ou senha incorretos');
        } else if (error.response?.status === 400) {
          throw new Error('Dados inválidos. Verifique as informações e tente novamente');
        }
      }
      throw error;
    }
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      console.log('Register attempt with email:', credentials.email);
      const response = await axios.post('https://truemetrics-n8n-n8n.b5glig.easypanel.host/webhook/auth/register', credentials);
      console.log('Raw register response:', response.data);
      
      // Verificar se a resposta é um array e pegar o primeiro item
      const responseData = Array.isArray(response.data) ? response.data[0] : response.data;
      console.log('Processed register response:', responseData);
      
      // Verificar se a resposta contém os dados necessários
      if (!responseData || !responseData.userId) {
        console.error('Invalid register response:', responseData);
        throw new Error('Resposta de registro inválida: ID do usuário não encontrado');
      }
      
      // Garantir que a resposta tenha o formato esperado
      const authResponse: AuthResponse = {
        token: responseData.token || '',
        userId: responseData.userId,
        name: responseData.name || credentials.name,
        email: responseData.email || credentials.email
      };
      
      // Armazenar dados do usuário no localStorage
      localStorage.setItem('token', authResponse.token);
      localStorage.setItem('userId', authResponse.userId);
      localStorage.setItem('user', JSON.stringify({
        name: authResponse.name,
        email: authResponse.email
      }));
      
      console.log('Formatted register response:', authResponse);
      return authResponse;
    } catch (error) {
      console.error('Registration error:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 409) {
          throw new Error('Este email já está cadastrado');
        } else if (error.response?.status === 400) {
          throw new Error('Dados inválidos. Verifique as informações e tente novamente');
        }
      }
      throw error;
    }
  },

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    console.log('Logged out successfully');
  },

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  getUserId(): string | null {
    return localStorage.getItem('userId');
  },
  
  async getUserById(userId: string): Promise<User> {
    try {
      console.log('Fetching user data for userId:', userId);
      const response = await axios.get(`https://truemetrics-n8n-n8n.b5glig.easypanel.host/webhook/getUserById?userId=${userId}`);
      console.log('Raw user data response:', response.data);
      
      // Se a resposta é um array, pegar o primeiro item
      const userData = Array.isArray(response.data) ? response.data[0] : response.data;
      console.log('Processed user data:', userData);
      
      if (!userData || !userData.id) {
        console.error('Invalid user data response:', userData);
        throw new Error('Dados do usuário inválidos');
      }
      
      // Atualizar localStorage com os dados mais recentes
      localStorage.setItem('user', JSON.stringify({
        name: userData.name,
        email: userData.email
      }));
      
      return userData;
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  }
};

interface TransactionService {
  getTransactions(userId: string): Promise<Transaction[]>;
  createTransaction(transaction: Omit<Transaction, "id">): Promise<Transaction>;
  testConnection(useNoCors?: boolean, useAuth?: boolean): Promise<boolean>;
}

const transactionService: TransactionService = {
  async getTransactions(userId: string): Promise<Transaction[]> {
    try {
      // Verificar se temos um userId válido
      if (!userId) {
        console.error('getTransactions: userId não fornecido');
        throw new Error('UserId é obrigatório');
      }

      // Encode the userId to ensure it's properly formatted in the URL
      const encodedUserId = encodeURIComponent(userId);
      console.log('getTransactions: Fazendo requisição com userId:', userId);
      console.log('getTransactions: userId codificado:', encodedUserId);
      console.log('getTransactions: URL completa:', `https://truemetrics-n8n-n8n.b5glig.easypanel.host/webhook/transactions/getTransactions?userId=${encodedUserId}`);
      
      // Corrigir a URL para garantir que o userId seja enviado corretamente
      const response = await axios.get(
        `https://truemetrics-n8n-n8n.b5glig.easypanel.host/webhook/transactions/getTransactions?userId=${encodedUserId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );
      console.log('getTransactions: Resposta da API:', response.data);

      if (!response.data) {
        throw new Error('Nenhum dado retornado pela API');
      }

      console.log('Dados recebidos da API:', response.data);
      
      // Handle the response format from the API
      let transactions: Transaction[];
      
      // Check if the response has a transactions property
      if (response.data.transactions && Array.isArray(response.data.transactions)) {
        console.log('getTransactions: Usando transactions do objeto de resposta');
        transactions = response.data.transactions;
      } 
      // Handle both array and object responses
      else if (Array.isArray(response.data)) {
        console.log('getTransactions: Resposta é um array');
        transactions = response.data;
      } else if (typeof response.data === 'object') {
        // If it's an object, check if it has a data property that's an array
        if (Array.isArray(response.data.data)) {
          console.log('getTransactions: Usando data do objeto de resposta');
          transactions = response.data.data;
        } else if (Array.isArray(Object.values(response.data))) {
          // If the object values form an array of transactions
          console.log('getTransactions: Usando valores do objeto como array');
          transactions = Object.values(response.data);
        } else {
          console.error('Formato de resposta inesperado:', response.data);
          throw new Error('Formato de dados inválido recebido do servidor');
        }
      } else {
        console.error('Formato de resposta inesperado:', response.data);
        throw new Error('Formato de dados inválido recebido do servidor');
      }

      // Return the raw transactions without processing
      console.log('getTransactions: Retornando transações brutas:', transactions);
      return transactions;
    } catch (error) {
      console.error('Get transactions error:', error);
      
      // Return mock data if API fails
      console.log('Falling back to mock data');
      return getMockTransactions();
    }
  },

  async createTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
    try {
      // Get userId from authService
      const userId = authService.getUserId();
      if (!userId) {
        console.error('UserId não encontrado');
        throw new Error('Usuário não autenticado');
      }
      
      // Add userId to the transaction
      const transactionWithUserId = {
        ...transaction,
        userId
      };
      
      console.log('Criando transação com userId:', userId);
      const response = await axios.post(
        `https://truemetrics-n8n-n8n.b5glig.easypanel.host/webhook/transaction/create`,
        transactionWithUserId,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );
      
      console.log('Resposta da API ao criar transação:', response.data);
      return response.data;
    } catch (error) {
      console.error('Create transaction error:', error);
      throw error;
    }
  },

  async testConnection(useNoCors?: boolean, useAuth?: boolean): Promise<boolean> {
    try {
      const userId = authService.getUserId();
      const url = useNoCors 
        ? `https://truemetrics-n8n-n8n.b5glig.easypanel.host/webhook/transactions/test${useAuth ? `?userId=${userId}` : ''}`
        : `/api/proxy?path=/webhook/transactions/test${useAuth ? `&userId=${userId}` : ''}`;
      
      console.log('Testing connection to:', url);
      
      try {
        const response = await axios.get(url);
        console.log('Connection test response:', response.data);
        return response.status === 200;
      } catch (axiosError) {
        console.warn('Axios request failed, trying fetch...', axiosError);
        
        // Try with fetch as fallback
        const fetchResponse = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        console.log('Fetch response status:', fetchResponse.status);
        return fetchResponse.ok;
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
};

const userService = {
  async getUserById(userId: string): Promise<User> {
    try {
      console.log('userService: Buscando usuário com ID:', userId);
      const response = await axios.get(`https://truemetrics-n8n-n8n.b5glig.easypanel.host/webhook/user/getUserById?userId=${userId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      console.log('userService: Resposta da API:', response.data);
      
      // Verificar se a resposta contém os dados esperados
      if (!response.data) {
        console.error('userService: Resposta inválida da API:', response.data);
        throw new Error('Resposta inválida da API');
      }
      
      // Se a resposta é um array, pegar o primeiro item
      const userData = Array.isArray(response.data) ? response.data[0] : response.data;
      
      if (!userData || typeof userData !== 'object') {
        console.error('userService: Dados do usuário inválidos:', userData);
        throw new Error('Dados do usuário inválidos');
      }
      
      // Garantir que os dados retornados tenham o formato esperado
      const processedUserData = {
        id: userData.id?.toString() || userId,
        name: userData.name || 'Usuário',
        email: userData.email || 'usuario@exemplo.com',
        createdAt: userData.createdAt || new Date().toISOString(),
        updatedAt: userData.updatedAt || new Date().toISOString()
      };
      
      console.log('userService: Dados do usuário processados:', processedUserData);
      return processedUserData;
    } catch (error) {
      console.error('Get user by ID error:', error);
      throw error;
    }
  },

  async updateUser(userId: string, userData: Partial<User>): Promise<User> {
    try {
      const response = await api.post('', {
        path: `/webhook/users/${userId}`,
        body: userData
      });
      return response.data;
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  },

  async deleteUser(userId: string): Promise<void> {
    try {
      await api.post('', {
        path: `/webhook/users/${userId}`,
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Delete user error:', error);
      throw error;
    }
  },
  
  async testConnection(useAuth: boolean = false): Promise<boolean> {
    const userId = authService.getUserId();
    const url = `${API_BASE_URL}/webhook/test-connection${useAuth ? `?userId=${userId}` : ''}`;
    console.log('Testing connection to:', url);

    try {
      console.log('Attempting connection test with Axios...');
      const response = await api.get(url);
      console.log('Connection test successful with Axios:', response.data);
      return true;
    } catch (error) {
      console.error('Axios connection test failed, trying Fetch API...', error);
      
      // Tentar com fetch sem credenciais
      try {
        console.log('Trying fetch without credentials...');
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(useAuth && { 'Authorization': `Bearer ${authService.getToken()}` }),
          },
          // Remover credentials: 'include' para evitar o erro de CORS
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log('Connection test successful with Fetch without credentials');
        return true;
      } catch (fetchError) {
        console.error('Fetch connection test without credentials failed, trying with CORS proxy...', fetchError);
        
        // Tentar com proxy CORS
        try {
          console.log('Trying with CORS proxy...');
          const corsProxyUrl = `https://cors-anywhere.herokuapp.com/${url}`;
          const response = await fetch(corsProxyUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Origin': window.location.origin,
              ...(useAuth && { 'Authorization': `Bearer ${authService.getToken()}` }),
            },
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          console.log('Connection test successful with CORS proxy');
          return true;
        } catch (proxyError) {
          console.error('CORS proxy connection test failed, trying XMLHttpRequest...', proxyError);
          
          // Tentar com XMLHttpRequest sem credenciais
          return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.setRequestHeader('Accept', 'application/json');
            if (useAuth) {
              xhr.setRequestHeader('Authorization', `Bearer ${authService.getToken()}`);
            }
            // Remover withCredentials para evitar o erro de CORS
            
            xhr.onload = function() {
              if (xhr.status === 200) {
                console.log('Connection test successful with XMLHttpRequest without credentials');
                resolve(true);
              } else {
                reject(new Error(`HTTP error! status: ${xhr.status}`));
              }
            };
            
            xhr.onerror = function() {
              reject(new Error('Network error occurred'));
            };
            
            xhr.send();
          });
        }
      }
    }
  }
};

export {  userService, transactionService, getMockTransactions }; 