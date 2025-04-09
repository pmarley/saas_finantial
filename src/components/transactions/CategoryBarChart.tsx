'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Transaction } from '@/types/transaction';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

type CategoryBarChartProps = {
  transactions: Transaction[];
};

export default function CategoryBarChart({
  transactions,
}: CategoryBarChartProps) {
  // Group transactions by category
  const categories = transactions.reduce((acc, transaction) => {
    const categoryName = transaction.category || 'Sem categoria';
    if (!acc[categoryName]) {
      acc[categoryName] = { income: 0, expense: 0 };
    }
    if (transaction.type === 'income') {
      acc[categoryName].income += transaction.amount;
    } else {
      acc[categoryName].expense += transaction.amount;
    }
    return acc;
  }, {} as Record<string, { income: number; expense: number }>);

  // Sort categories by total amount
  const sortedCategories = Object.entries(categories).sort((a, b) => {
    const totalA = a[1].income - a[1].expense;
    const totalB = b[1].income - b[1].expense;
    return Math.abs(totalB) - Math.abs(totalA);
  });

  const data = {
    labels: sortedCategories.map(([name]) => name),
    datasets: [
      {
        label: 'Receitas',
        data: sortedCategories.map(([, value]) => value.income),
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
      },
      {
        label: 'Despesas',
        data: sortedCategories.map(([, value]) => value.expense),
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1,
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Receitas e Despesas por Categoria',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw as number;
            return `${context.dataset.label}: R$ ${value.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return `R$ ${Number(value).toFixed(2)}`;
          },
        },
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <Bar data={data} options={options} />
    </div>
  );
} 