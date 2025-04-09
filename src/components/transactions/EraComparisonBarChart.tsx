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

type EraComparisonBarChartProps = {
  transactions: Transaction[];
};

export default function EraComparisonBarChart({ transactions }: EraComparisonBarChartProps) {
  // Group transactions by era
  const eraData = transactions.reduce((acc, transaction) => {
    const date = new Date(transaction.date);
    const year = date.getFullYear();
    let era = '';

    if (year < 0) {
      era = 'AEC';
    } else if (year >= 0 && year < 500) {
      era = 'Idade Antiga';
    } else if (year >= 500 && year < 1500) {
      era = 'Idade Média';
    } else if (year >= 1500 && year < 1800) {
      era = 'Idade Moderna';
    } else {
      era = 'Idade Contemporânea';
    }

    if (!acc[era]) {
      acc[era] = { income: 0, expense: 0, count: 0 };
    }

    if (transaction.type === 'income') {
      acc[era].income += transaction.amount;
    } else {
      acc[era].expense += transaction.amount;
    }
    acc[era].count += 1;

    return acc;
  }, {} as Record<string, { income: number; expense: number; count: number }>);

  // Calculate era averages
  const eraAverages = Object.entries(eraData).map(([era, data]) => ({
    era,
    incomeAverage: data.income / data.count,
    expenseAverage: data.expense / data.count,
    count: data.count,
  }));

  // Sort eras in chronological order
  const eraOrder = ['AEC', 'Idade Antiga', 'Idade Média', 'Idade Moderna', 'Idade Contemporânea'];
  eraAverages.sort((a, b) => eraOrder.indexOf(a.era) - eraOrder.indexOf(b.era));

  const data = {
    labels: eraAverages.map(item => item.era),
    datasets: [
      {
        label: 'Média de Receitas (R$)',
        data: eraAverages.map(item => item.incomeAverage),
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
      },
      {
        label: 'Média de Despesas (R$)',
        data: eraAverages.map(item => item.expenseAverage),
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
        text: 'Comparação por Era',
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || '';
            const value = context.raw || 0;
            const era = context.label;
            const eraData = eraAverages.find(item => item.era === era);
            return [
              `${label}: R$ ${value.toFixed(2)}`,
              `Total de transações: ${eraData?.count || 0}`,
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