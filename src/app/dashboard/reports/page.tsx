'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { transactionService } from '@/services/api';
import { 
  TransactionSummary,
  TransactionFilters,
  TransactionChart,
  CategoryPieChart,
  TransactionLineChart,
  MonthlyBarChart,
  CategoryBarChart,
  CategoryLineChart,
  TypePieChart,
  TransactionScatterPlot,
  CategoryRadarChart,
  TransactionAreaChart,
  CategoryHorizontalBarChart,
  MonthlyStackedBarChart,
  CategoryStackedHorizontalBarChart,
  TransactionCategories
} from '@/components/transactions';
import { Transaction, TransactionFilters as TransactionFiltersType } from '@/types/transaction';

type ApiResponse = {
  data?: Transaction[];
  transactions?: Transaction[];
  items?: Transaction[];
};

type ReportType = 'summary' | 'trends' | 'categories' | 'comparison' | 'custom';

export default function ReportsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TransactionFiltersType>({
    type: 'all',
    startDate: '',
    endDate: '',
  });
  const [activeReport, setActiveReport] = useState<ReportType>('summary');
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);

  // Função para formatar valores monetários
  const formatCurrency = (value: number): string => {
    return value.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log('Fetching transactions for reports...');
        
        // Get userId from localStorage
        const userId = localStorage.getItem('userId');
        if (!userId) {
          console.error('UserId não encontrado no localStorage');
          setError('Usuário não autenticado');
          setIsLoading(false);
          return;
        }
        
        const transactions = await transactionService.getTransactions(userId);
        console.log('Transactions fetched for reports:', transactions);
        
        if (Array.isArray(transactions)) {
          // Ensure each transaction has the required fields
          const validTransactions = transactions.map((transaction: any) => ({
            id: transaction.id || String(Date.now()) + Math.random().toString(36).substr(2, 9),
            description: transaction.description || 'Transação sem descrição',
            amount: typeof transaction.amount === 'number' ? transaction.amount : 0,
            date: transaction.date || new Date().toISOString().split('T')[0],
            type: transaction.type === 'income' || transaction.type === 'expense' || transaction.type === 'investment' 
              ? transaction.type 
              : 'expense',
            category: transaction.category || 'Sem categoria'
          }));
          setTransactions(validTransactions);
        } else {
          console.error('Invalid data format:', transactions);
          setError('Formato de dados inválido recebido do servidor');
        }
      } catch (err) {
        console.error('Error in fetchTransactions:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching transactions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const filteredTransactions = useMemo(() => {
    console.log('Filtrando transações com filtros:', filters);
    console.log('Transações antes da filtragem:', transactions);
    
    const filtered = transactions.filter((transaction) => {
      // Filter by type
      if (filters.type !== 'all' && transaction.type !== filters.type) {
        return false;
      }

      // Filter by date range
      if (filters.startDate && transaction.date < filters.startDate) {
        return false;
      }
      if (filters.endDate && transaction.date > filters.endDate) {
        return false;
      }

      return true;
    });
    
    console.log('Transações após a filtragem:', filtered);
    return filtered;
  }, [transactions, filters]);

  // Adaptar transações para os componentes de gráficos
  const chartTransactions = useMemo(() => {
    // Incluir todas as transações, incluindo investimentos
    return filteredTransactions.map(t => ({
      ...t,
      // Para componentes que esperam apenas income/expense, converter investment para expense
      type: t.type === 'investment' ? 'expense' : t.type as 'income' | 'expense'
    }));
  }, [filteredTransactions]);

  // Adaptar transações para o TransactionSummary
  const summaryTransactions = useMemo(() => {
    return filteredTransactions.map(t => ({
      ...t,
      type: t.type === 'investment' ? 'expense' : t.type
    }));
  }, [filteredTransactions]);

  const handleFilterChange = (newFilters: TransactionFiltersType) => {
    setFilters(newFilters);
  };

  const renderReportContent = () => {
    switch (activeReport) {
      case 'summary':
        return (
          <div className="space-y-6">
            <TransactionSummary transactions={summaryTransactions} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TransactionChart transactions={chartTransactions} />
              <CategoryPieChart transactions={chartTransactions} />
            </div>
            <TransactionLineChart transactions={chartTransactions} />
          </div>
        );
      case 'trends':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <MonthlyBarChart transactions={chartTransactions} />
              <TransactionAreaChart transactions={chartTransactions} />
              <MonthlyStackedBarChart transactions={chartTransactions} />
              <TransactionScatterPlot transactions={chartTransactions} />
            </div>
          </div>
        );
      case 'categories':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CategoryBarChart transactions={chartTransactions} />
              <CategoryLineChart transactions={chartTransactions} />
              <CategoryPieChart transactions={chartTransactions} />
              <CategoryRadarChart transactions={chartTransactions} />
              <CategoryHorizontalBarChart transactions={chartTransactions} />
              <CategoryStackedHorizontalBarChart transactions={chartTransactions} />
            </div>
            <TransactionCategories transactions={chartTransactions} />
          </div>
        );
      case 'comparison':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TypePieChart transactions={chartTransactions} />
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Comparação de Períodos</h3>
                <p className="text-gray-500">Esta funcionalidade será implementada em breve.</p>
              </div>
            </div>
          </div>
        );
      case 'custom':
        return (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Relatório Personalizado</h3>
            <p className="text-gray-500">Esta funcionalidade será implementada em breve.</p>
          </div>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600 text-center">
          <h2 className="text-xl font-semibold mb-2">Erro</h2>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Relatórios</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Imprimir Relatório
          </button>
          <button
            onClick={() => {
              // Implementar exportação para PDF ou Excel
              alert('Funcionalidade de exportação será implementada em breve.');
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Exportar
          </button>
        </div>
      </div>

      {connectionStatus && (
        <div className={`p-4 rounded-md ${connectionStatus.includes('successful') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {connectionStatus}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-100 text-red-800 rounded-md">
          <p className="font-medium">Erro ao carregar transações:</p>
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveReport('summary')}
            className={`px-4 py-2 rounded-md ${
              activeReport === 'summary'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Resumo
          </button>
          <button
            onClick={() => setActiveReport('trends')}
            className={`px-4 py-2 rounded-md ${
              activeReport === 'trends'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Tendências
          </button>
          <button
            onClick={() => setActiveReport('categories')}
            className={`px-4 py-2 rounded-md ${
              activeReport === 'categories'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Categorias
          </button>
          <button
            onClick={() => setActiveReport('comparison')}
            className={`px-4 py-2 rounded-md ${
              activeReport === 'comparison'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Comparação
          </button>
          <button
            onClick={() => setActiveReport('custom')}
            className={`px-4 py-2 rounded-md ${
              activeReport === 'custom'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Personalizado
          </button>
        </div>
      </div>

      <TransactionFilters filters={filters} onChange={handleFilterChange} />

      <div className="bg-white shadow rounded-lg p-6">
        {renderReportContent()}
      </div>
    </div>
  );
} 