'use client';

import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Transaction } from '@/types/transaction';

type TransactionScatterPlotProps = {
  transactions: Transaction[];
};

export default function TransactionScatterPlot({ transactions }: TransactionScatterPlotProps) {
  const processData = () => {
    return transactions.map((transaction) => ({
      date: new Date(transaction.date).getTime(),
      amount: transaction.amount,
      type: transaction.type,
      description: transaction.description,
    }));
  };

  const data = processData();

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Distribuição de Transações</h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="date"
              name="Data"
              tickFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <YAxis type="number" dataKey="amount" name="Valor" />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-2 border rounded shadow">
                      <p className="font-semibold">{data.description}</p>
                      <p>Data: {new Date(data.date).toLocaleDateString()}</p>
                      <p>Valor: {data.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                      <p>Tipo: {data.type}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Scatter data={data} fill="#8884d8" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 