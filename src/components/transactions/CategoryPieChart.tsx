'use client';

import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title
);

type CategoryPieChartProps = {
  transactions: {
    category?: string;
    amount: number;
    type: 'income' | 'expense';
  }[];
};

export default function CategoryPieChart({
  transactions,
}: CategoryPieChartProps) {
  // Group transactions by category
  const categories = transactions.reduce((acc, transaction) => {
    const categoryName = transaction.category || 'Sem categoria';
    if (!acc[categoryName]) {
      acc[categoryName] = 0;
    }
    acc[categoryName] +=
      transaction.type === 'income' ? transaction.amount : -transaction.amount;
    return acc;
  }, {} as Record<string, number>);

  // Sort categories by absolute value
  const sortedCategories = Object.entries(categories).sort(
    (a, b) => Math.abs(b[1]) - Math.abs(a[1])
  );

  // Generate random colors for each category
  const generateColors = (count: number) => {
    const colors = [];
    for (let i = 0; i < count; i++) {
      const hue = (i * 360) / count;
      colors.push(`hsla(${hue}, 70%, 50%, 0.5)`);
    }
    return colors;
  };

  const data = {
    labels: sortedCategories.map(([name]) => name),
    datasets: [
      {
        data: sortedCategories.map(([, value]) => Math.abs(value)),
        backgroundColor: generateColors(sortedCategories.length),
        borderColor: generateColors(sortedCategories.length).map((color) =>
          color.replace('0.5', '1')
        ),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: true,
        text: 'Distribuição por Categoria',
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const value = context.raw || 0;
            return `${label}: R$ ${value.toFixed(2)}`;
          },
        },
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <Pie data={data} options={options} />
    </div>
  );
} 