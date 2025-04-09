'use client';

import React, { useState, useEffect } from 'react';
import { transactionService, getMockTransactions } from '@/services/api';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import UserInfo from '@/components/dashboard/UserInfo';
import { Transaction } from '@/types/transaction';
import { userService } from '@/services/api';
import ErrorBoundary from '@/components/ErrorBoundary';
import { TooltipProvider } from '@/components/ui/tooltip';

type Summary = {
  current: {
    income: number;
    expenses: number;
    investments: number;
    balance: number;
  };
  previous: {
    income: number;
    expenses: number;
    investments: number;
    balance: number;
  };
  changes: {
    income: number;
    expenses: number;
    investments: number;
    balance: number;
  };
};

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);
  const [summary, setSummary] = useState<Summary>({
    current: {
      income: 0,
      expenses: 0,
      investments: 0,
      balance: 0
    },
    previous: {
      income: 0,
      expenses: 0,
      investments: 0,
      balance: 0
    },
    changes: {
      income: 0,
      expenses: 0,
      investments: 0,
      balance: 0
    }
  });
  const [apiStatus, setApiStatus] = useState<'connected' | 'disconnected' | 'error'>('disconnected');

  // Função para formatar valores monetários
  const formatCurrency = (value: number): string => {
    return value.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const fetchData = async () => {
    try {
      console.log('Dashboard: Iniciando carregamento das transações');
      setLoading(true);
      setError(null);
      setConnectionStatus(null);
      setApiStatus('disconnected');
      
      const userId = localStorage.getItem('userId');
      console.log('UserId recuperado:', userId); // Debug

      if (!userId) {
        throw new Error('Usuário não autenticado');
      }

      // Test connection first
      const isConnected = await transactionService.testConnection();
      setApiStatus(isConnected ? 'connected' : 'error');

      console.log('Chamando getTransactions com userId:', userId); // Debug
      const transactions = await transactionService.getTransactions(userId);
      console.log('Transactions loaded:', transactions);
      
      if (Array.isArray(transactions)) {
        setTransactions(transactions);
        calculateSummary(transactions);
      } else {
        console.error('Invalid data format:', transactions);
        throw new Error('Formato de dados inválido recebido do servidor');
      }
    } catch (err) {
      console.error('Erro ao carregar transações:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar transações';
      setError(`${errorMessage}. Usando dados mockados como fallback.`);
      
      // Use mock data as fallback
      const mockTransactions = getMockTransactions();
      setTransactions(mockTransactions);
      calculateSummary(mockTransactions);
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (transactions: Transaction[]) => {
    console.log('Dashboard: Calculando resumo das transações:', transactions);
    
    // Obter a data atual e o primeiro dia do mês atual
    const now = new Date();
    const firstDayOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    console.log('Dashboard: Período de cálculo - Mês atual:', firstDayOfCurrentMonth, 'Mês anterior:', firstDayOfPreviousMonth);
    
    // Filtrar transações do mês atual e do mês anterior
    const currentMonthTransactions = transactions.filter(t => 
      new Date(t.date) >= firstDayOfCurrentMonth
    );
    
    const previousMonthTransactions = transactions.filter(t => 
      new Date(t.date) >= firstDayOfPreviousMonth && new Date(t.date) < firstDayOfCurrentMonth
    );
    
    console.log('Dashboard: Transações do mês atual:', currentMonthTransactions.length);
    console.log('Dashboard: Transações do mês anterior:', previousMonthTransactions.length);
    
    // Calcular totais do mês atual
    const currentMonthSummary = {
      income: currentMonthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0),
      expenses: currentMonthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0),
      investments: currentMonthTransactions
        .filter(t => t.type === 'investment')
        .reduce((sum, t) => sum + t.amount, 0),
      balance: 0 // Será calculado abaixo
    };
    
    // Calcular o saldo do mês atual
    currentMonthSummary.balance = 
      currentMonthSummary.income - currentMonthSummary.expenses - currentMonthSummary.investments;
    
    console.log('Dashboard: Resumo do mês atual:', currentMonthSummary);
    
    // Calcular totais do mês anterior
    const previousMonthSummary = {
      income: previousMonthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0),
      expenses: previousMonthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0),
      investments: previousMonthTransactions
        .filter(t => t.type === 'investment')
        .reduce((sum, t) => sum + t.amount, 0),
      balance: 0 // Será calculado abaixo
    };
    
    // Calcular o saldo do mês anterior
    previousMonthSummary.balance = 
      previousMonthSummary.income - previousMonthSummary.expenses - previousMonthSummary.investments;
    
    console.log('Dashboard: Resumo do mês anterior:', previousMonthSummary);
    
    // Calcular as variações percentuais
    const incomeChange = previousMonthSummary.income === 0 
      ? 100 
      : ((currentMonthSummary.income - previousMonthSummary.income) / previousMonthSummary.income) * 100;
    
    const expensesChange = previousMonthSummary.expenses === 0 
      ? 100 
      : ((currentMonthSummary.expenses - previousMonthSummary.expenses) / previousMonthSummary.expenses) * 100;
    
    const investmentsChange = previousMonthSummary.investments === 0 
      ? 100 
      : ((currentMonthSummary.investments - previousMonthSummary.investments) / previousMonthSummary.investments) * 100;
    
    const balanceChange = previousMonthSummary.balance === 0 
      ? 100 
      : ((currentMonthSummary.balance - previousMonthSummary.balance) / previousMonthSummary.balance) * 100;
    
    console.log('Dashboard: Variações percentuais:', {
      income: incomeChange,
      expenses: expensesChange,
      investments: investmentsChange,
      balance: balanceChange
    });
    
    setSummary({
      current: currentMonthSummary,
      previous: previousMonthSummary,
      changes: {
        income: incomeChange,
        expenses: expensesChange,
        investments: investmentsChange,
        balance: balanceChange
      }
    });
  };

  const testConnection = async (useNoCors = false, useAuth = true) => {
    try {
      setConnectionStatus('Testando conexão...');
      const result = await transactionService.testConnection(useNoCors, useAuth);
      
      if (result) {
        setConnectionStatus('Conexão bem-sucedida');
        console.log('Teste de conexão bem-sucedido:', result);
      } else {
        setConnectionStatus('Falha na conexão');
        console.error('Falha no teste de conexão');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setConnectionStatus(`Erro ao testar conexão: ${errorMessage}`);
      console.error('Erro ao testar conexão:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <ErrorBoundary>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {apiStatus !== 'connected' && (
            <div className={`p-4 rounded-md ${
              apiStatus === 'error' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              <p>
                {apiStatus === 'error' 
                  ? 'Erro de conexão com o servidor. Tentando reconectar...' 
                  : 'Verificando conexão com o servidor...'}
              </p>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Resumo */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Receitas */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-sm font-medium text-gray-500">Receitas</h3>
                  <p className="mt-2 text-3xl font-semibold text-green-600">
                    {formatCurrency(summary.current.income)}
                  </p>
                  <p className={`mt-1 text-sm ${summary.changes.income >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {summary.changes.income >= 0 ? '↑' : '↓'} {Math.abs(summary.changes.income).toFixed(1)}% vs mês anterior
                  </p>
                </div>

                {/* Despesas */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-sm font-medium text-gray-500">Despesas</h3>
                  <p className="mt-2 text-3xl font-semibold text-red-600">
                    {formatCurrency(summary.current.expenses)}
                  </p>
                  <p className={`mt-1 text-sm ${summary.changes.expenses <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {summary.changes.expenses <= 0 ? '↓' : '↑'} {Math.abs(summary.changes.expenses).toFixed(1)}% vs mês anterior
                  </p>
                </div>

                {/* Investimentos */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-sm font-medium text-gray-500">Investimentos</h3>
                  <p className="mt-2 text-3xl font-semibold text-blue-600">
                    {formatCurrency(summary.current.investments)}
                  </p>
                  <p className={`mt-1 text-sm ${summary.changes.investments >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {summary.changes.investments >= 0 ? '↑' : '↓'} {Math.abs(summary.changes.investments).toFixed(1)}% vs mês anterior
                  </p>
                </div>

                {/* Saldo */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-sm font-medium text-gray-500">Saldo</h3>
                  <p className={`mt-2 text-3xl font-semibold ${summary.current.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(summary.current.balance)}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Saldo atual
                  </p>
                </div>
              </div>

              {/* Transações Recentes */}
              <RecentTransactions transactions={transactions} />
            </div>
          )}
        </div>
      </ErrorBoundary>
    </TooltipProvider>
  );
} 