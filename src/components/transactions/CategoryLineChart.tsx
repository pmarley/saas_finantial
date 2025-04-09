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
import { LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
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

type CategoryLineChartProps = {
  transactions: Transaction[];
};

export default function CategoryLineChart({
  transactions,
}: CategoryLineChartProps) {
  // Group transactions by category and date
  const categoryData = transactions.reduce((acc, transaction) => {
    const categoryName = transaction.category || 'Sem categoria';
    const date = transaction.date;

    if (!acc[categoryName]) {
      acc[categoryName] = {};
    }
    if (!acc[categoryName][date]) {
      acc[categoryName][date] = 0;
    }

    acc[categoryName][date] +=
      transaction.type === 'income' ? transaction.amount : -transaction.amount;

    return acc;
  }, {} as Record<string, Record<string, number>>);

  // Get all unique dates
  const allDates = Array.from(
    new Set(transactions.map((t) => t.date))
  ).sort();

  // Get top 5 categories by total amount
  const topCategories = Object.entries(categoryData)
    .map(([name, dates]) => ({
      name,
      total: Object.values(dates).reduce((sum, amount) => sum + amount, 0),
    }))
    .sort((a, b) => Math.abs(b.total) - Math.abs(a.total))
    .slice(0, 5)
    .map((c) => c.name);

  // Generate colors for each category
  const generateColors = (count: number) => {
    const colors = [];
    for (let i = 0; i < count; i++) {
      const hue = (i * 360) / count;
      colors.push({
        border: `hsl(${hue}, 70%, 50%)`,
        background: `hsla(${hue}, 70%, 50%, 0.5)`,
      });
    }
    return colors;
  };

  const colors = generateColors(topCategories.length);

  const data = {
    labels: allDates.map((date) =>
      new Date(date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
      })
    ),
    datasets: topCategories.map((category, index) => ({
      label: category,
      data: allDates.map((date) => categoryData[category][date] || 0),
      borderColor: colors[index].border,
      backgroundColor: colors[index].background,
      tension: 0.1,
    })),
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Evolução das Top 5 Categorias',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw as number;
            return `${context.dataset.label}: R$ ${value.toFixed(2)}`;
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