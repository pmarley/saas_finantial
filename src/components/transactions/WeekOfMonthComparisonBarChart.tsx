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

type WeekOfMonthComparisonBarChartProps = {
  transactions: Transaction[];
};

export default function WeekOfMonthComparisonBarChart({ transactions }: WeekOfMonthComparisonBarChartProps) {
  // Group transactions by week of month
  const weekData = transactions.reduce((acc, transaction) => {
    const date = new Date(transaction.date);
    const day = date.getDate();
    const week = Math.ceil(day / 7);

    if (!acc[week]) {
      acc[week] = { income: 0, expense: 0, count: 0 };
    }

    if (transaction.type === 'income') {
      acc[week].income += transaction.amount;
    } else {
      acc[week].expense += transaction.amount;
    }
    acc[week].count += 1;

    return acc;
  }, {} as Record<number, { income: number; expense: number; count: number }>);

  // Calculate week averages
  const weekAverages = Object.entries(weekData).map(([week, data]) => ({
    week: Number(week),
    incomeAverage: data.income / data.count,
    expenseAverage: data.expense / data.count,
    count: data.count,
  }));

  // Sort by week
  weekAverages.sort((a, b) => a.week - b.week);

  const data = {
    labels: weekAverages.map(item => `Semana ${item.week}`),
    datasets: [
      {
        label: 'Média de Receitas (R$)',
        data: weekAverages.map(item => item.incomeAverage),
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
      },
      {
        label: 'Média de Despesas (R$)',
        data: weekAverages.map(item => item.expenseAverage),
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
        text: 'Comparação por Semana do Mês',
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || '';
            const value = context.raw || 0;
            const week = context.label;
            const weekData = weekAverages.find(item => 
              `Semana ${item.week}` === week
            );
            return [
              `${label}: R$ ${value.toFixed(2)}`,
              `Total de transações: ${weekData?.count || 0}`,
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