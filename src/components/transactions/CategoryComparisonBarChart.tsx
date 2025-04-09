'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Transaction } from '@/types/transaction';

type CategoryComparisonBarChartProps = {
  transactions: Transaction[];
};

export default function CategoryComparisonBarChart({ transactions }: CategoryComparisonBarChartProps) {
  const processData = () => {
    const categoryData: { [key: string]: { income: number; expense: number; investment: number } } = {};

    transactions.forEach((transaction) => {
      const category = transaction.category || 'Sem categoria';

      if (!categoryData[category]) {
        categoryData[category] = { income: 0, expense: 0, investment: 0 };
      }

      if (transaction.type === 'income') {
        categoryData[category].income += transaction.amount;
      } else if (transaction.type === 'expense') {
        categoryData[category].expense += transaction.amount;
      } else if (transaction.type === 'investment') {
        categoryData[category].investment += transaction.amount;
      }
    });

    return Object.entries(categoryData).map(([category, data]) => ({
      category,
      ...data,
    }));
  };

  const data = processData();

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Comparação por Categoria</h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="income" name="Receitas" fill="#10B981" />
            <Bar dataKey="expense" name="Despesas" fill="#EF4444" />
            <Bar dataKey="investment" name="Investimentos" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 