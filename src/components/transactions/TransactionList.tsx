'use client';

import React from 'react';
import { Transaction } from '@/types/transaction';

type TransactionListProps = {
  transactions: Transaction[];
};

export default function TransactionList({ transactions }: TransactionListProps) {
  const formatCurrency = (value: number): string => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-6">
        <div className="flow-root">
          <ul className="-my-5 divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <li key={transaction.id} className="py-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {transaction.description}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(transaction.date).toLocaleDateString('pt-BR')}
                      {transaction.category && ` • ${transaction.category}`}
                    </p>
                  </div>
                  <div
                    className={`text-sm font-semibold ${
                      transaction.type === 'income'
                        ? 'text-green-600'
                        : transaction.type === 'expense'
                        ? 'text-red-600'
                        : 'text-blue-600'
                    }`}
                  >
                    {transaction.type === 'income' ? '+' : '-'}{' '}
                    {formatCurrency(Math.abs(transaction.amount))}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
} 