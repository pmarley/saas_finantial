'use client';

import React from 'react';
import { Transaction } from '@/types/transaction';

type TransactionCategoriesProps = {
  transactions: Transaction[];
};

type Category = {
  name: string;
  total: number;
  count: number;
};

export default function TransactionCategories({
  transactions,
}: TransactionCategoriesProps) {
  // Group transactions by category
  const categories = transactions.reduce((acc, transaction) => {
    const categoryName = transaction.category || 'Sem categoria';
    if (!acc[categoryName]) {
      acc[categoryName] = {
        name: categoryName,
        total: 0,
        count: 0,
      };
    }
    acc[categoryName].total +=
      transaction.type === 'income' ? transaction.amount : -transaction.amount;
    acc[categoryName].count += 1;
    return acc;
  }, {} as Record<string, Category>);

  const sortedCategories = Object.values(categories).sort(
    (a, b) => Math.abs(b.total) - Math.abs(a.total)
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Categorias de Transações
      </h3>
      <div className="space-y-4">
        {sortedCategories.map((category) => (
          <div key={category.name} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">
                {category.name}
              </p>
              <p className="text-sm text-gray-500">
                {category.count} transação{category.count !== 1 ? 'ões' : ''}
              </p>
            </div>
            <div
              className={`text-sm font-semibold ${
                category.total >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {category.total >= 0 ? '+' : '-'}R${' '}
              {Math.abs(category.total).toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 