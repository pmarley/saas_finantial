'use client';

import React from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { Transaction } from '@/types/transaction';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  Title
);

type CategoryRadarChartProps = {
  transactions: Transaction[];
};

export default function CategoryRadarChart({ transactions }: CategoryRadarChartProps) {
  // Calculate totals by category and type
  const categoryTotals = transactions.reduce((acc, transaction) => {
    const key = `${transaction.category || 'Sem categoria'}-${transaction.type}`;
    acc[key] = (acc[key] || 0) + transaction.amount;
    return acc;
  }, {} as Record<string, number>);

  // Get unique categories
  const categories = Array.from(
    new Set(transactions.map(t => t.category || 'Sem categoria'))
  ).sort();

  const data = {
    labels: categories,
    datasets: [
      {
        label: 'Receitas',
        data: categories.map(category => 
          categoryTotals[`${category}-income`] || 0
        ),
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 2,
      },
      {
        label: 'Despesas',
        data: categories.map(category => 
          categoryTotals[`${category}-expense`] || 0
        ),
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Distribuição por Categoria',
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || '';
            const value = context.raw || 0;
            return `${label}: R$ ${value.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      r: {
        type: 'radialLinear' as const,
        beginAtZero: true,
        ticks: {
          callback: function(tickValue: number | string) {
            return `R$ ${Number(tickValue).toFixed(2)}`;
          },
        },
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <Radar data={data} options={options} />
    </div>
  );
} 