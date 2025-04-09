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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

type Transaction = {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
};

type DecadeComparisonBarChartProps = {
  transactions: Transaction[];
};

export default function DecadeComparisonBarChart({ transactions }: DecadeComparisonBarChartProps) {
  // Group transactions by decade
  const decadeData = transactions.reduce((acc, transaction) => {
    const date = new Date(transaction.date);
    const year = date.getFullYear();
    const decade = Math.floor(year / 10) * 10;

    if (!acc[decade]) {
      acc[decade] = { income: 0, expense: 0, count: 0 };
    }

    if (transaction.type === 'income') {
      acc[decade].income += transaction.amount;
    } else {
      acc[decade].expense += transaction.amount;
    }
    acc[decade].count += 1;

    return acc;
  }, {} as Record<number, { income: number; expense: number; count: number }>);

  // Calculate decade averages
  const decadeAverages = Object.entries(decadeData).map(([decade, data]) => ({
    decade: Number(decade),
    incomeAverage: data.income / data.count,
    expenseAverage: data.expense / data.count,
    count: data.count,
  }));

  // Sort by decade
  decadeAverages.sort((a, b) => a.decade - b.decade);

  const data = {
    labels: decadeAverages.map(item => `${item.decade}s`),
    datasets: [
      {
        label: 'Média de Receitas (R$)',
        data: decadeAverages.map(item => item.incomeAverage),
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
      },
      {
        label: 'Média de Despesas (R$)',
        data: decadeAverages.map(item => item.expenseAverage),
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
        text: 'Comparação por Década',
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || '';
            const value = context.raw || 0;
            const decade = context.label;
            const decadeData = decadeAverages.find(item => 
              `${item.decade}s` === decade
            );
            return [
              `${label}: R$ ${value.toFixed(2)}`,
              `Total de transações: ${decadeData?.count || 0}`,
            ];
          },
        },
      },
    },
    scales: {
      y: {
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