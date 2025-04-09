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
import { Transaction } from '@/types/transaction';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

type CosmicEraComparisonBarChartProps = {
  transactions: Transaction[];
};

export default function CosmicEraComparisonBarChart({ transactions }: CosmicEraComparisonBarChartProps) {
  // Group transactions by cosmic era
  const eraData = transactions.reduce((acc, transaction) => {
    const date = new Date(transaction.date);
    const year = date.getFullYear();
    let era = '';

    if (year < -13700000000) {
      era = 'Era Planck';
    } else if (year >= -13700000000 && year < -10000000000) {
      era = 'Era da Radiação';
    } else if (year >= -10000000000 && year < -5000000000) {
      era = 'Era da Matéria';
    } else if (year >= -5000000000 && year < -4600000000) {
      era = 'Era da Formação Planetária';
    } else {
      era = 'Era da Vida';
    }

    if (!acc[era]) {
      acc[era] = { income: 0, expense: 0, count: 0 };
    }

    if (transaction.type === 'income') {
      acc[era].income += transaction.amount;
    } else {
      acc[era].expense += transaction.amount;
    }
    acc[era].count += 1;

    return acc;
  }, {} as Record<string, { income: number; expense: number; count: number }>);

  // Calculate era averages
  const eraAverages = Object.entries(eraData).map(([era, data]) => ({
    era,
    incomeAverage: data.income / data.count,
    expenseAverage: data.expense / data.count,
    count: data.count,
  }));

  // Sort eras in chronological order
  const eraOrder = ['Era Planck', 'Era da Radiação', 'Era da Matéria', 'Era da Formação Planetária', 'Era da Vida'];
  eraAverages.sort((a, b) => eraOrder.indexOf(a.era) - eraOrder.indexOf(b.era));

  const data = {
    labels: eraAverages.map(item => item.era),
    datasets: [
      {
        label: 'Média de Receitas (R$)',
        data: eraAverages.map(item => item.incomeAverage),
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
      },
      {
        label: 'Média de Despesas (R$)',
        data: eraAverages.map(item => item.expenseAverage),
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
        text: 'Comparação por Era Cósmica',
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || '';
            const value = context.raw || 0;
            const era = context.label;
            const eraData = eraAverages.find(item => item.era === era);
            return [
              `${label}: R$ ${value.toFixed(2)}`,
              `Total de transações: ${eraData?.count || 0}`,
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