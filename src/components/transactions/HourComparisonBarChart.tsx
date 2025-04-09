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

type HourComparisonBarChartProps = {
  transactions: Transaction[];
};

export default function HourComparisonBarChart({ transactions }: HourComparisonBarChartProps) {
  // Group transactions by hour
  const hourData = transactions.reduce((acc, transaction) => {
    const date = new Date(transaction.date);
    const hour = date.getHours();

    if (!acc[hour]) {
      acc[hour] = { income: 0, expense: 0, count: 0 };
    }

    if (transaction.type === 'income') {
      acc[hour].income += transaction.amount;
    } else {
      acc[hour].expense += transaction.amount;
    }
    acc[hour].count += 1;

    return acc;
  }, {} as Record<number, { income: number; expense: number; count: number }>);

  // Calculate hour averages
  const hourAverages = Object.entries(hourData).map(([hour, data]) => ({
    hour: Number(hour),
    incomeAverage: data.income / data.count,
    expenseAverage: data.expense / data.count,
    count: data.count,
  }));

  // Sort by hour
  hourAverages.sort((a, b) => a.hour - b.hour);

  const data = {
    labels: hourAverages.map(item => `${item.hour}:00`),
    datasets: [
      {
        label: 'Média de Receitas (R$)',
        data: hourAverages.map(item => item.incomeAverage),
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
      },
      {
        label: 'Média de Despesas (R$)',
        data: hourAverages.map(item => item.expenseAverage),
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
        text: 'Comparação por Hora do Dia',
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || '';
            const value = context.raw || 0;
            const hour = context.label;
            const hourData = hourAverages.find(item => 
              `${item.hour}:00` === hour
            );
            return [
              `${label}: R$ ${value.toFixed(2)}`,
              `Total de transações: ${hourData?.count || 0}`,
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