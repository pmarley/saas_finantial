'use client';

import React from 'react';
import { Transaction } from '@/types/transaction';

type TransactionSummaryProps = {
  transactions: Transaction[];
};

export default function TransactionSummary({ transactions }: TransactionSummaryProps) {
  const formatCurrency = (value: number): string => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const calculateTotals = () => {
    return transactions.reduce(
      (acc, transaction) => {
        if (transaction.type === 'income') {
          acc.income += transaction.amount;
        } else if (transaction.type === 'expense') {
          acc.expense += transaction.amount;
        } else if (transaction.type === 'investment') {
          acc.investment += transaction.amount;
        }
        return acc;
      },
      { income: 0, expense: 0, investment: 0 }
    );
  };

  const totals = calculateTotals();
  const balance = totals.income - totals.expense;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Resumo</h2>
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-500">Receitas</p>
          <p className="text-lg font-semibold text-green-600">{formatCurrency(totals.income)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Despesas</p>
          <p className="text-lg font-semibold text-red-600">{formatCurrency(totals.expense)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Investimentos</p>
          <p className="text-lg font-semibold text-blue-600">{formatCurrency(totals.investment)}</p>
        </div>
        <div className="pt-4 border-t">
          <p className="text-sm text-gray-500">Saldo</p>
          <p className={`text-lg font-semibold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(balance)}
          </p>
        </div>
      </div>
    </div>
  );
} 