'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Transaction } from '@/types/transaction';

type MonthlyComparisonBarChartProps = {
  transactions: Transaction[];
};

export default function MonthlyComparisonBarChart({ transactions }: MonthlyComparisonBarChartProps) {
  const processData = () => {
    const monthlyData: { [key: string]: { income: number; expense: number; investment: number } } = {};

    transactions.forEach((transaction) => {
      const date = new Date(transaction.date);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;

      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = { income: 0, expense: 0, investment: 0 };
      }

      if (transaction.type === 'income') {
        monthlyData[monthYear].income += transaction.amount;
      } else if (transaction.type === 'expense') {
        monthlyData[monthYear].expense += transaction.amount;
      } else if (transaction.type === 'investment') {
        monthlyData[monthYear].investment += transaction.amount;
      }
    });

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      ...data,
    }));
  };

  const data = processData();

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Comparação Mensal</h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
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