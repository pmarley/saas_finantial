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

type WeekdayComparisonBarChartProps = {
  transactions: Transaction[];
};

export default function WeekdayComparisonBarChart({ transactions }: WeekdayComparisonBarChartProps) {
  // Group transactions by weekday
  const weekdayData = transactions.reduce((acc, transaction) => {
    const date = new Date(transaction.date);
    const weekday = date.getDay(); // 0 = Sunday, 1 = Monday, etc.

    if (!acc[weekday]) {
      acc[weekday] = { income: 0, expense: 0, count: 0 };
    }

    if (transaction.type === 'income') {
      acc[weekday].income += transaction.amount;
    } else {
      acc[weekday].expense += transaction.amount;
    }
    acc[weekday].count += 1;

    return acc;
  }, {} as Record<number, { income: number; expense: number; count: number }>);

  // Calculate weekday averages
  const weekdayAverages = Object.entries(weekdayData).map(([weekday, data]) => ({
    weekday: Number(weekday),
    incomeAverage: data.income / data.count,
    expenseAverage: data.expense / data.count,
    count: data.count,
  }));

  // Sort by weekday
  weekdayAverages.sort((a, b) => a.weekday - b.weekday);

  const weekdayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  const data = {
    labels: weekdayAverages.map(item => weekdayNames[item.weekday]),
    datasets: [
      {
        label: 'Média de Receitas (R$)',
        data: weekdayAverages.map(item => item.incomeAverage),
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
      },
      {
        label: 'Média de Despesas (R$)',
        data: weekdayAverages.map(item => item.expenseAverage),
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
        text: 'Comparação por Dia da Semana',
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || '';
            const value = context.raw || 0;
            const weekday = context.label;
            const weekdayData = weekdayAverages.find(item => 
              weekdayNames[item.weekday] === weekday
            );
            return [
              `${label}: R$ ${value.toFixed(2)}`,
              `Total de transações: ${weekdayData?.count || 0}`,
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