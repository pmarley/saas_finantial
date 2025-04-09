import { useState, useEffect } from 'react';
import { Category, CategoryType } from '@/types/category';
import { categoryService } from '@/services/categoryService';

// Define the API response type
interface CategoryResponse {
  data?: Category[];
  categories?: Category[];
}

export function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    type: 'expense' as CategoryType,
    color: '#000000'
  });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('CategoryManager - Iniciando carregamento de categorias...');
      const categories = await categoryService.getCategories();
      console.log('CategoryManager - Categorias retornadas pelo serviço:', JSON.stringify(categories));
      
      if (Array.isArray(categories) && categories.length > 0) {
        console.log('CategoryManager - Definindo categorias no estado:', categories.length);
        setCategories(categories);
      } else {
        console.log('CategoryManager - Nenhuma categoria retornada, usando padrões');
        // Em caso de erro ou nenhuma categoria, usar categorias padrão
        const defaultCategories: Category[] = [
          { id: '1', name: 'Salário', type: 'income' as CategoryType, isDefault: true },
          { id: '2', name: 'Freelance', type: 'income' as CategoryType, isDefault: true },
          { id: '3', name: 'Moradia', type: 'expense' as CategoryType, isDefault: true },
          { id: '4', name: 'Alimentação', type: 'expense' as CategoryType, isDefault: true },
          { id: '5', name: 'Ações', type: 'investment' as CategoryType, isDefault: true }
        ];
        console.log('CategoryManager - Usando categorias padrão:', defaultCategories);
        setCategories(defaultCategories);
      }
    } catch (err) {
      console.error('CategoryManager - Erro ao carregar categorias:', err);
      setError('Erro ao carregar categorias');
      // Em caso de erro, usar categorias padrão
      const defaultCategories: Category[] = [
        { id: '1', name: 'Salário', type: 'income' as CategoryType, isDefault: true },
        { id: '2', name: 'Freelance', type: 'income' as CategoryType, isDefault: true },
        { id: '3', name: 'Moradia', type: 'expense' as CategoryType, isDefault: true },
        { id: '4', name: 'Alimentação', type: 'expense' as CategoryType, isDefault: true },
        { id: '5', name: 'Ações', type: 'investment' as CategoryType, isDefault: true }
      ];
      console.log('CategoryManager - Usando categorias padrão após erro:', defaultCategories);
      setCategories(defaultCategories);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      
      // Verificar se já existe uma categoria com o mesmo nome
      const existingCategory = categories.find(
        cat => cat.name.toLowerCase() === newCategory.name.toLowerCase()
      );
      
      if (existingCategory) {
        setError(`Já existe uma categoria com o nome "${newCategory.name}". Por favor, escolha outro nome.`);
        return;
      }
      
      const result = await categoryService.createCategory(newCategory);
      console.log('Categoria criada:', result);
      setNewCategory({ name: '', type: 'expense', color: '#000000' });
      loadCategories();
    } catch (err: any) {
      console.error('Erro ao criar categoria:', err);
      setError(err.message || 'Erro ao criar categoria');
    }
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    try {
      // Verificar se já existe outra categoria com o mesmo nome (excluindo a categoria atual)
      const existingCategory = categories.find(
        cat => cat.id !== editingCategory.id && 
              cat.name.toLowerCase() === editingCategory.name.toLowerCase()
      );
      
      if (existingCategory) {
        setError(`Já existe uma categoria com o nome "${editingCategory.name}". Por favor, escolha outro nome.`);
        return;
      }
      
      const result = await categoryService.updateCategory(editingCategory.id, editingCategory);
      console.log('Categoria atualizada:', result);
      setEditingCategory(null);
      loadCategories();
    } catch (err) {
      console.error('Erro ao atualizar categoria:', err);
      setError('Erro ao atualizar categoria');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return;

    try {
      await categoryService.deleteCategory(categoryId);
      loadCategories();
    } catch (err) {
      console.error('Erro ao excluir categoria:', err);
      setError('Erro ao excluir categoria');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Nova Categoria</h2>
        <form onSubmit={handleCreateCategory} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome</label>
            <input
              type="text"
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tipo</label>
            <select
              value={newCategory.type}
              onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value as CategoryType })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="income">Receita</option>
              <option value="expense">Despesa</option>
              <option value="investment">Investimento</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Cor</label>
            <input
              type="color"
              value={newCategory.color}
              onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
              className="mt-1 block w-full"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
          >
            Adicionar Categoria
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Categorias Existentes</h2>
        <div className="space-y-4">
          {Array.isArray(categories) && categories.length > 0 ? (
            categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color || '#000000' }}
                  />
                  <div>
                    <p className="font-medium">{category.name}</p>
                    <p className="text-sm text-gray-500">
                      {category.type === 'income'
                        ? 'Receita'
                        : category.type === 'expense'
                        ? 'Despesa'
                        : 'Investimento'}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditingCategory(category)}
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">Nenhuma categoria encontrada</p>
          )}
        </div>
      </div>

      {editingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Editar Categoria</h2>
            <form onSubmit={handleUpdateCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome</label>
                <input
                  type="text"
                  value={editingCategory.name}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, name: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tipo</label>
                <select
                  value={editingCategory.type}
                  onChange={(e) =>
                    setEditingCategory({
                      ...editingCategory,
                      type: e.target.value as CategoryType,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="income">Receita</option>
                  <option value="expense">Despesa</option>
                  <option value="investment">Investimento</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Cor</label>
                <input
                  type="color"
                  value={editingCategory.color || '#000000'}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, color: e.target.value })
                  }
                  className="mt-1 block w-full"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 