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

type YearComparisonBarChartProps = {
  transactions: Transaction[];
};

export default function YearComparisonBarChart({ transactions }: YearComparisonBarChartProps) {
  // Group transactions by year
  const yearData = transactions.reduce((acc, transaction) => {
    const date = new Date(transaction.date);
    const year = date.getFullYear();

    if (!acc[year]) {
      acc[year] = { income: 0, expense: 0, count: 0 };
    }

    if (transaction.type === 'income') {
      acc[year].income += transaction.amount;
    } else {
      acc[year].expense += transaction.amount;
    }
    acc[year].count += 1;

    return acc;
  }, {} as Record<number, { income: number; expense: number; count: number }>);

  // Calculate year averages
  const yearAverages = Object.entries(yearData).map(([year, data]) => ({
    year: Number(year),
    incomeAverage: data.income / data.count,
    expenseAverage: data.expense / data.count,
    count: data.count,
  }));

  // Sort by year
  yearAverages.sort((a, b) => a.year - b.year);

  const data = {
    labels: yearAverages.map(item => item.year.toString()),
    datasets: [
      {
        label: 'Média de Receitas (R$)',
        data: yearAverages.map(item => item.incomeAverage),
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
      },
      {
        label: 'Média de Despesas (R$)',
        data: yearAverages.map(item => item.expenseAverage),
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
        text: 'Comparação por Ano',
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || '';
            const value = context.raw || 0;
            const year = context.label;
            const yearData = yearAverages.find(item => 
              item.year.toString() === year
            );
            return [
              `${label}: R$ ${value.toFixed(2)}`,
              `Total de transações: ${yearData?.count || 0}`,
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