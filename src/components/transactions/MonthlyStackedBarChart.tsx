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
import { Transaction } from '@/types/transaction';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

type MonthlyStackedBarChartProps = {
  transactions: Transaction[];
};

export default function MonthlyStackedBarChart({ transactions }: MonthlyStackedBarChartProps) {
  // Group transactions by month
  const monthlyData = transactions.reduce((acc, transaction) => {
    const date = new Date(transaction.date);
    const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;

    if (!acc[monthYear]) {
      acc[monthYear] = { income: 0, expense: 0, balance: 0 };
    }

    if (transaction.type === 'income') {
      acc[monthYear].income += transaction.amount;
      acc[monthYear].balance += transaction.amount;
    } else {
      acc[monthYear].expense += transaction.amount;
      acc[monthYear].balance -= transaction.amount;
    }

    return acc;
  }, {} as Record<string, { income: number; expense: number; balance: number }>);

  // Sort months
  const sortedMonths = Object.keys(monthlyData).sort((a, b) => {
    const [monthA, yearA] = a.split('/').map(Number);
    const [monthB, yearB] = b.split('/').map(Number);
    return yearA === yearB ? monthA - monthB : yearA - yearB;
  });

  const data = {
    labels: sortedMonths.map((month) => {
      const [m, y] = month.split('/');
      return `${m}/${y}`;
    }),
    datasets: [
      {
        label: 'Receitas',
        data: sortedMonths.map((month) => monthlyData[month].income),
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
      },
      {
        label: 'Despesas',
        data: sortedMonths.map((month) => monthlyData[month].expense),
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
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Receitas e Despesas por Mês (Empilhadas)',
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || '';
            const value = context.raw || 0;
            return `${label}: R$ ${value.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
        beginAtZero: true,
        ticks: {
          callback: function(value: number | string) {
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