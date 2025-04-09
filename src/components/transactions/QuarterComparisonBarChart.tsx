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

type QuarterComparisonBarChartProps = {
  transactions: Transaction[];
};

export default function QuarterComparisonBarChart({ transactions }: QuarterComparisonBarChartProps) {
  // Group transactions by quarter
  const quarterData = transactions.reduce((acc, transaction) => {
    const date = new Date(transaction.date);
    const month = date.getMonth();
    const quarter = Math.floor(month / 3) + 1;

    if (!acc[quarter]) {
      acc[quarter] = { income: 0, expense: 0, count: 0 };
    }

    if (transaction.type === 'income') {
      acc[quarter].income += transaction.amount;
    } else {
      acc[quarter].expense += transaction.amount;
    }
    acc[quarter].count += 1;

    return acc;
  }, {} as Record<number, { income: number; expense: number; count: number }>);

  // Calculate quarter averages
  const quarterAverages = Object.entries(quarterData).map(([quarter, data]) => ({
    quarter: Number(quarter),
    incomeAverage: data.income / data.count,
    expenseAverage: data.expense / data.count,
    count: data.count,
  }));

  // Sort by quarter
  quarterAverages.sort((a, b) => a.quarter - b.quarter);

  const quarterNames = {
    1: '1º Trimestre',
    2: '2º Trimestre',
    3: '3º Trimestre',
    4: '4º Trimestre',
  };

  const data = {
    labels: quarterAverages.map(item => quarterNames[item.quarter as keyof typeof quarterNames]),
    datasets: [
      {
        label: 'Média de Receitas (R$)',
        data: quarterAverages.map(item => item.incomeAverage),
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
      },
      {
        label: 'Média de Despesas (R$)',
        data: quarterAverages.map(item => item.expenseAverage),
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
        text: 'Comparação por Trimestre',
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || '';
            const value = context.raw || 0;
            const quarter = context.label;
            const quarterData = quarterAverages.find(item => 
              quarterNames[item.quarter as keyof typeof quarterNames] === quarter
            );
            return [
              `${label}: R$ ${value.toFixed(2)}`,
              `Total de transações: ${quarterData?.count || 0}`,
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