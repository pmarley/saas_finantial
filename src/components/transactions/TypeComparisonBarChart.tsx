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

type TypeComparisonBarChartProps = {
  transactions: Transaction[];
};

export default function TypeComparisonBarChart({ transactions }: TypeComparisonBarChartProps) {
  // Group transactions by type
  const typeData = transactions.reduce((acc, transaction) => {
    const type = transaction.type;

    if (!acc[type]) {
      acc[type] = { total: 0, count: 0, average: 0 };
    }

    acc[type].total += transaction.amount;
    acc[type].count += 1;
    acc[type].average = acc[type].total / acc[type].count;

    return acc;
  }, {} as Record<string, { total: number; count: number; average: number }>);

  // Calculate type percentages
  const totalAmount = Object.values(typeData).reduce((sum, data) => sum + data.total, 0);
  const typePercentages = Object.entries(typeData).map(([type, data]) => ({
    type,
    percentage: (data.total / totalAmount) * 100,
    average: data.average,
  }));

  const data = {
    labels: typePercentages.map(item => item.type === 'income' ? 'Receitas' : 'Despesas'),
    datasets: [
      {
        label: 'Percentual do Total (%)',
        data: typePercentages.map(item => item.percentage),
        backgroundColor: typePercentages.map(item => 
          item.type === 'income' ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)'
        ),
        borderColor: typePercentages.map(item => 
          item.type === 'income' ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'
        ),
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
        text: 'Comparação por Tipo de Transação (%)',
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || '';
            const value = context.raw || 0;
            const type = context.label;
            const average = typePercentages.find(item => 
              item.type === (type === 'Receitas' ? 'income' : 'expense')
            )?.average || 0;
            return [
              `${label}: ${value.toFixed(2)}%`,
              `Média por transação: R$ ${average.toFixed(2)}`,
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
            return `${Number(value).toFixed(2)}%`;
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