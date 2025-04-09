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

type SemesterComparisonBarChartProps = {
  transactions: Transaction[];
};

export default function SemesterComparisonBarChart({ transactions }: SemesterComparisonBarChartProps) {
  // Group transactions by semester
  const semesterData = transactions.reduce((acc, transaction) => {
    const date = new Date(transaction.date);
    const month = date.getMonth();
    const semester = Math.floor(month / 6) + 1;

    if (!acc[semester]) {
      acc[semester] = { income: 0, expense: 0, count: 0 };
    }

    if (transaction.type === 'income') {
      acc[semester].income += transaction.amount;
    } else {
      acc[semester].expense += transaction.amount;
    }
    acc[semester].count += 1;

    return acc;
  }, {} as Record<number, { income: number; expense: number; count: number }>);

  // Calculate semester averages
  const semesterAverages = Object.entries(semesterData).map(([semester, data]) => ({
    semester: Number(semester),
    incomeAverage: data.income / data.count,
    expenseAverage: data.expense / data.count,
    count: data.count,
  }));

  // Sort by semester
  semesterAverages.sort((a, b) => a.semester - b.semester);

  const semesterNames = {
    1: '1º Semestre',
    2: '2º Semestre',
  };

  const data = {
    labels: semesterAverages.map(item => semesterNames[item.semester as keyof typeof semesterNames]),
    datasets: [
      {
        label: 'Média de Receitas (R$)',
        data: semesterAverages.map(item => item.incomeAverage),
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
      },
      {
        label: 'Média de Despesas (R$)',
        data: semesterAverages.map(item => item.expenseAverage),
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
        text: 'Comparação por Semestre',
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || '';
            const value = context.raw || 0;
            const semester = context.label;
            const semesterData = semesterAverages.find(item => 
              semesterNames[item.semester as keyof typeof semesterNames] === semester
            );
            return [
              `${label}: R$ ${value.toFixed(2)}`,
              `Total de transações: ${semesterData?.count || 0}`,
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