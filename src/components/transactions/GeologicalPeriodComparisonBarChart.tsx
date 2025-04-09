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

type GeologicalPeriodComparisonBarChartProps = {
  transactions: Transaction[];
};

export default function GeologicalPeriodComparisonBarChart({ transactions }: GeologicalPeriodComparisonBarChartProps) {
  // Group transactions by geological period
  const periodData = transactions.reduce((acc, transaction) => {
    const date = new Date(transaction.date);
    const year = date.getFullYear();
    let period = '';

    if (year < -540000000) {
      period = 'Pré-Cambriano';
    } else if (year >= -540000000 && year < -251000000) {
      period = 'Paleozoico';
    } else if (year >= -251000000 && year < -66000000) {
      period = 'Mesozoico';
    } else if (year >= -66000000 && year < -2300000) {
      period = 'Cenozoico';
    } else {
      period = 'Quaternário';
    }

    if (!acc[period]) {
      acc[period] = { income: 0, expense: 0, count: 0 };
    }

    if (transaction.type === 'income') {
      acc[period].income += transaction.amount;
    } else {
      acc[period].expense += transaction.amount;
    }
    acc[period].count += 1;

    return acc;
  }, {} as Record<string, { income: number; expense: number; count: number }>);

  // Calculate period averages
  const periodAverages = Object.entries(periodData).map(([period, data]) => ({
    period,
    incomeAverage: data.income / data.count,
    expenseAverage: data.expense / data.count,
    count: data.count,
  }));

  // Sort periods in chronological order
  const periodOrder = ['Pré-Cambriano', 'Paleozoico', 'Mesozoico', 'Cenozoico', 'Quaternário'];
  periodAverages.sort((a, b) => periodOrder.indexOf(a.period) - periodOrder.indexOf(b.period));

  const data = {
    labels: periodAverages.map(item => item.period),
    datasets: [
      {
        label: 'Média de Receitas (R$)',
        data: periodAverages.map(item => item.incomeAverage),
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
      },
      {
        label: 'Média de Despesas (R$)',
        data: periodAverages.map(item => item.expenseAverage),
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
        text: 'Comparação por Período Geológico',
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || '';
            const value = context.raw || 0;
            const period = context.label;
            const periodData = periodAverages.find(item => item.period === period);
            return [
              `${label}: R$ ${value.toFixed(2)}`,
              `Total de transações: ${periodData?.count || 0}`,
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