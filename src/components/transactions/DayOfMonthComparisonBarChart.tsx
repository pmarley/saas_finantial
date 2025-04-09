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

type DayOfMonthComparisonBarChartProps = {
  transactions: Transaction[];
};

export default function DayOfMonthComparisonBarChart({ transactions }: DayOfMonthComparisonBarChartProps) {
  // Group transactions by day of month
  const dayData = transactions.reduce((acc, transaction) => {
    const date = new Date(transaction.date);
    const day = date.getDate();

    if (!acc[day]) {
      acc[day] = { income: 0, expense: 0, count: 0 };
    }

    if (transaction.type === 'income') {
      acc[day].income += transaction.amount;
    } else {
      acc[day].expense += transaction.amount;
    }
    acc[day].count += 1;

    return acc;
  }, {} as Record<number, { income: number; expense: number; count: number }>);

  // Calculate day averages
  const dayAverages = Object.entries(dayData).map(([day, data]) => ({
    day: Number(day),
    incomeAverage: data.income / data.count,
    expenseAverage: data.expense / data.count,
    count: data.count,
  }));

  // Sort by day
  dayAverages.sort((a, b) => a.day - b.day);

  const data = {
    labels: dayAverages.map(item => `Dia ${item.day}`),
    datasets: [
      {
        label: 'Média de Receitas (R$)',
        data: dayAverages.map(item => item.incomeAverage),
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
      },
      {
        label: 'Média de Despesas (R$)',
        data: dayAverages.map(item => item.expenseAverage),
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
        text: 'Comparação por Dia do Mês',
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || '';
            const value = context.raw || 0;
            const day = context.label;
            const dayData = dayAverages.find(item => 
              `Dia ${item.day}` === day
            );
            return [
              `${label}: R$ ${value.toFixed(2)}`,
              `Total de transações: ${dayData?.count || 0}`,
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