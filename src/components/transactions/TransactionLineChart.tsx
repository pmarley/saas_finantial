'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Transaction } from '@/types/transaction';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type TransactionLineChartProps = {
  transactions: Transaction[];
};

export default function TransactionLineChart({
  transactions,
}: TransactionLineChartProps) {
  // Group transactions by date
  const dailyData = transactions.reduce((acc, transaction) => {
    const date = transaction.date;
    if (!acc[date]) {
      acc[date] = { income: 0, expense: 0, balance: 0 };
    }
    if (transaction.type === 'income') {
      acc[date].income += transaction.amount;
      acc[date].balance += transaction.amount;
    } else {
      acc[date].expense += transaction.amount;
      acc[date].balance -= transaction.amount;
    }
    return acc;
  }, {} as Record<string, { income: number; expense: number; balance: number }>);

  // Sort dates
  const sortedDates = Object.keys(dailyData).sort();

  // Calculate cumulative balance
  let cumulativeBalance = 0;
  const balanceData = sortedDates.map((date) => {
    cumulativeBalance += dailyData[date].balance;
    return cumulativeBalance;
  });

  const data = {
    labels: sortedDates.map((date) =>
      new Date(date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
      })
    ),
    datasets: [
      {
        label: 'Saldo',
        data: balanceData,
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        tension: 0.1,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Evolução do Saldo',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw as number;
            return `Saldo: R$ ${value.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return `R$ ${Number(value).toFixed(2)}`;
          },
        },
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <Line data={data} options={options} />
    </div>
  );
} 