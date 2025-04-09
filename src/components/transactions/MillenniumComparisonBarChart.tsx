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

type MillenniumComparisonBarChartProps = {
  transactions: Transaction[];
};

export default function MillenniumComparisonBarChart({ transactions }: MillenniumComparisonBarChartProps) {
  // Group transactions by millennium
  const millenniumData = transactions.reduce((acc, transaction) => {
    const date = new Date(transaction.date);
    const year = date.getFullYear();
    const millennium = Math.floor(year / 1000) * 1000;

    if (!acc[millennium]) {
      acc[millennium] = { income: 0, expense: 0, count: 0 };
    }

    if (transaction.type === 'income') {
      acc[millennium].income += transaction.amount;
    } else {
      acc[millennium].expense += transaction.amount;
    }
    acc[millennium].count += 1;

    return acc;
  }, {} as Record<number, { income: number; expense: number; count: number }>);

  // Calculate millennium averages
  const millenniumAverages = Object.entries(millenniumData).map(([millennium, data]) => ({
    millennium: Number(millennium),
    incomeAverage: data.income / data.count,
    expenseAverage: data.expense / data.count,
    count: data.count,
  }));

  // Sort by millennium
  millenniumAverages.sort((a, b) => a.millennium - b.millennium);

  const data = {
    labels: millenniumAverages.map(item => `${item.millennium}s`),
    datasets: [
      {
        label: 'Média de Receitas (R$)',
        data: millenniumAverages.map(item => item.incomeAverage),
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
      },
      {
        label: 'Média de Despesas (R$)',
        data: millenniumAverages.map(item => item.expenseAverage),
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
        text: 'Comparação por Milênio',
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || '';
            const value = context.raw || 0;
            const millennium = context.label;
            const millenniumData = millenniumAverages.find(item => 
              `${item.millennium}s` === millennium
            );
            return [
              `${label}: R$ ${value.toFixed(2)}`,
              `Total de transações: ${millenniumData?.count || 0}`,
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