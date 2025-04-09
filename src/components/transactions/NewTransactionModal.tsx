'use client';

import React, { useState, useEffect } from 'react';
import { transactionService } from '@/services/api';
import { Transaction } from '@/types/transaction';
import { Category } from '@/types/category';
import { categoryService } from '@/services/categoryService';

type NewTransactionModalProps = {
  isOpen: boolean;
  onCloseAction: () => void;
  onSuccessAction: () => void;
};

export default function NewTransactionModal({
  isOpen,
  onCloseAction,
  onSuccessAction,
}: NewTransactionModalProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<Transaction['type']>('expense');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [availableTypes, setAvailableTypes] = useState<Transaction['type'][]>([]);

  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  // Efeito para atualizar o tipo selecionado quando as categorias são carregadas
  useEffect(() => {
    if (categories.length > 0) {
      // Extrair tipos únicos das categorias disponíveis
      const types = Array.from(new Set(categories.map(cat => cat.type))) as Transaction['type'][];
      console.log('NewTransactionModal - Tipos disponíveis:', types);
      setAvailableTypes(types);
      
      // Se o tipo atual não está disponível, mudar para o primeiro tipo disponível
      if (!types.includes(type)) {
        console.log(`NewTransactionModal - Tipo atual ${type} não está disponível, mudando para ${types[0]}`);
        setType(types[0]);
        setCategory(''); // Resetar categoria ao mudar o tipo
      }
    }
  }, [categories]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (typeof window !== 'undefined') {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          setError('Usuário não autenticado');
          return;
        }
        
        const data = await categoryService.getCategories();
        if (Array.isArray(data)) {
          setCategories(data);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
      setError('Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      const result = await transactionService.createTransaction({
        description,
        amount: parseFloat(amount),
        type,
        category: category || undefined,
        date,
      });
      
      if (result) {
        setSuccess(true);
        // Limpar o formulário
        setDescription('');
        setAmount('');
        setType('expense');
        setCategory('');
        setDate(new Date().toISOString().split('T')[0]);
        
        // Notificar o componente pai sobre o sucesso
        onSuccessAction();
        
        // Fechar o modal após um breve delay
        setTimeout(() => {
          onCloseAction();
          setSuccess(false);
        }, 1500);
      } else {
        setError('Erro ao criar transação');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar transação');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtrar categorias pelo tipo selecionado
  const filteredCategories = categories.filter(cat => cat.type === type);
  console.log(`NewTransactionModal - Categorias filtradas para o tipo ${type}:`, filteredCategories);
  console.log('NewTransactionModal - Todas as categorias:', categories);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Nova Transação</h2>
        
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-md">
            Transação criada com sucesso!
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Descrição
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Valor
            </label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tipo
            </label>
            <select
              value={type}
              onChange={(e) => {
                const newType = e.target.value as Transaction['type'];
                console.log(`NewTransactionModal - Tipo alterado para: ${newType}`);
                setType(newType);
                setCategory(''); // Reset category when type changes
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="income">Receita</option>
              <option value="expense">Despesa</option>
              <option value="investment">Investimento</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Categoria
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              disabled={loading}
            >
              <option value="">Selecione uma categoria</option>
              {filteredCategories.length > 0 ? (
                filteredCategories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  Nenhuma categoria disponível para este tipo
                </option>
              )}
            </select>
            {loading && (
              <p className="mt-1 text-sm text-gray-500">Carregando categorias...</p>
            )}
            {error && (
              <p className="mt-1 text-sm text-red-500">{error}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Data
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onCloseAction}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 