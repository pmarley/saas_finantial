'use client';

import React, { useEffect, useState } from 'react';
import { Transaction, TransactionFilters as TransactionFiltersType } from '@/types/transaction';
import { transactionService } from '@/services/api';
import { 
  TransactionFilters as TransactionFiltersComponent,
  TransactionSummary,
  MonthlyComparisonBarChart,
  CategoryComparisonBarChart,
  TransactionScatterPlot,
  TransactionList,
  NewTransactionModal
} from '@/components/transactions';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TransactionFiltersType>({
    type: 'all',
    startDate: '',
    endDate: '',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, [filters]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get userId from localStorage
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.error('UserId não encontrado no localStorage');
        setError('Usuário não autenticado');
        setLoading(false);
        return;
      }
      
      const transactions = await transactionService.getTransactions(userId);
      setTransactions(transactions);
    } catch (err) {
      setError('Erro ao carregar transações');
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: TransactionFiltersType) => {
    setFilters(newFilters);
  };

  const handleNewTransactionSuccess = () => {
    fetchTransactions();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Erro!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Transações</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
        >
          Nova Transação
        </button>
      </div>

      <TransactionFiltersComponent filters={filters} onChange={handleFilterChange} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <TransactionSummary transactions={transactions} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <MonthlyComparisonBarChart transactions={transactions} />
        <CategoryComparisonBarChart transactions={transactions} />
      </div>

      <div className="mb-8">
        <TransactionScatterPlot transactions={transactions} />
      </div>

      <TransactionList transactions={transactions} />

      <NewTransactionModal
        isOpen={isModalOpen}
        onCloseAction={() => setIsModalOpen(false)}
        onSuccessAction={handleNewTransactionSuccess}
      />
    </div>
  );
} 