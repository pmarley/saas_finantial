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

type PeriodComparisonBarChartProps = {
  transactions: Transaction[];
};

export default function PeriodComparisonBarChart({ transactions }: PeriodComparisonBarChartProps) {
  // Group transactions by period
  const periodData = transactions.reduce((acc, transaction) => {
    const date = new Date(transaction.date);
    const hour = date.getHours();
    let period: 'morning' | 'afternoon' | 'night';

    if (hour >= 5 && hour < 12) {
      period = 'morning';
    } else if (hour >= 12 && hour < 18) {
      period = 'afternoon';
    } else {
      period = 'night';
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

  // Sort by period
  const periodOrder = { morning: 0, afternoon: 1, night: 2 };
  periodAverages.sort((a, b) => periodOrder[a.period as keyof typeof periodOrder] - periodOrder[b.period as keyof typeof periodOrder]);

  const periodNames = {
    morning: 'Manhã (5h-12h)',
    afternoon: 'Tarde (12h-18h)',
    night: 'Noite (18h-5h)',
  };

  const data = {
    labels: periodAverages.map(item => periodNames[item.period as keyof typeof periodNames]),
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
        text: 'Comparação por Período do Dia',
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || '';
            const value = context.raw || 0;
            const period = context.label;
            const periodData = periodAverages.find(item => 
              periodNames[item.period as keyof typeof periodNames] === period
            );
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