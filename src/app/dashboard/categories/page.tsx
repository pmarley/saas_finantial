'use client';

import { CategoryManager } from '@/components/categories/CategoryManager';

export default function CategoriesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Gerenciar Categorias</h1>
        <p className="text-gray-600 mt-2">
          Crie e gerencie categorias para suas transações
        </p>
      </div>

      <CategoryManager />
    </div>
  );
} 