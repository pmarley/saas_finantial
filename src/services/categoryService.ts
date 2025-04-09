import axios from 'axios';
import { Category } from '@/types/category';
import { CategoryType } from '@/types/category';
import { authService } from './api';

const BASE_URL = 'https://truemetrics-n8n-n8n.b5glig.easypanel.host/webhook';

// Categorias padrão do sistema
const DEFAULT_CATEGORIES: Omit<Category, 'id'>[] = [
  // Receitas
  { name: 'Salário', type: 'income', isDefault: true },
  { name: 'Freelance', type: 'income', isDefault: true },
  { name: 'Investimentos', type: 'income', isDefault: true },
  { name: 'Outros', type: 'income', isDefault: true },
  
  // Despesas
  { name: 'Moradia', type: 'expense', isDefault: true },
  { name: 'Alimentação', type: 'expense', isDefault: true },
  { name: 'Transporte', type: 'expense', isDefault: true },
  { name: 'Saúde', type: 'expense', isDefault: true },
  { name: 'Educação', type: 'expense', isDefault: true },
  { name: 'Lazer', type: 'expense', isDefault: true },
  { name: 'Outros', type: 'expense', isDefault: true },
  
  // Investimentos
  { name: 'Ações', type: 'investment', isDefault: true },
  { name: 'Fundos', type: 'investment', isDefault: true },
  { name: 'Criptomoedas', type: 'investment', isDefault: true },
  { name: 'Outros', type: 'investment', isDefault: true },
];

interface ApiResponse<T> {
  data?: T;
  categories?: T[];
  error?: string;
}

function isValidCategory(data: any): data is Category {
  const validTypes = ['income', 'expense', 'investment'];
  
  // Verificar se é um objeto válido
  if (typeof data !== 'object' || data === null) {
    console.log('Categoria inválida: não é um objeto', data);
    return false;
  }
  
  // Verificar campos obrigatórios
  if (typeof data.name !== 'string') {
    console.log('Categoria inválida: nome não é uma string', data);
    return false;
  }
  
  if (typeof data.type !== 'string' || !validTypes.includes(data.type)) {
    console.log('Categoria inválida: tipo não é válido', data);
    return false;
  }
  
  // Se não tiver ID, vamos gerar um
  if (typeof data.id !== 'string') {
    data.id = `cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    console.log('ID gerado para categoria:', data.id);
  }
  
  return true;
}

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    try {
      const userId = authService.getUserId();
      console.log('categoryService.getCategories - userId:', userId);
      
      if (!userId) {
        console.warn('categoryService.getCategories - Usuário não autenticado, retornando categorias padrão');
        return DEFAULT_CATEGORIES.map((category, index) => ({
          ...category,
          id: `default-${index}`
        }));
      }

      const url = `${BASE_URL}/category/getCategories?userId=${userId}`;
      console.log('categoryService.getCategories - URL da requisição:', url);
      
      const response = await fetch(
        url,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
          },
        }
      );

      console.log('categoryService.getCategories - Status da resposta:', response.status);
      
      if (!response.ok) {
        console.error('categoryService.getCategories - Resposta não OK:', response.status, response.statusText);
        throw new Error('Falha ao buscar categorias');
      }

      const data = await response.json();
      console.log('categoryService.getCategories - Resposta da API (bruta):', JSON.stringify(data));
      
      let rawCategories: any[] = [];

      if (Array.isArray(data)) {
        rawCategories = data;
        console.log('categoryService.getCategories - Dados são um array direto:', rawCategories);
      } else if (data?.data && Array.isArray(data.data)) {
        rawCategories = data.data;
        console.log('categoryService.getCategories - Dados estão em data.data:', rawCategories);
      } else if (data?.categories && Array.isArray(data.categories)) {
        rawCategories = data.categories;
        console.log('categoryService.getCategories - Dados estão em data.categories:', rawCategories);
      } else if (data?.transactions && Array.isArray(data.transactions)) {
        rawCategories = data.transactions;
        console.log('categoryService.getCategories - Dados estão em data.transactions:', rawCategories);
      } else {
        console.log('categoryService.getCategories - Formato de dados não reconhecido:', data);
        // Se não conseguimos extrair categorias, retornar as padrão
        return DEFAULT_CATEGORIES.map((category, index) => ({
          ...category,
          id: `default-${index}`
        }));
      }

      console.log('categoryService.getCategories - Categorias brutas antes da validação:', rawCategories);
      
      const categories: Category[] = rawCategories
        .filter(isValidCategory)
        .map(category => ({
          id: String(category.id),
          name: category.name,
          type: category.type,
          color: category.color,
          isDefault: Boolean(category.isDefault),
          userId: String(category.userId || userId)
        }));
      
      console.log('categoryService.getCategories - Categorias após validação e mapeamento:', categories);

      // Se não houver categorias válidas, retornar as padrão
      if (categories.length === 0) {
        console.warn('categoryService.getCategories - Nenhuma categoria válida encontrada, retornando padrões');
        return DEFAULT_CATEGORIES.map((category, index) => ({
          ...category,
          id: `default-${index}`
        }));
      }

      return categories;
    } catch (error) {
      console.error('categoryService.getCategories - Erro ao buscar categorias:', error);
      // Em caso de erro, retornar categorias padrão
      return DEFAULT_CATEGORIES.map((category, index) => ({
        ...category,
        id: `default-${index}`
      }));
    }
  },

  async createCategory(category: Omit<Category, 'id'>): Promise<Category> {
    try {
      const userId = authService.getUserId();
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }

      const response = await axios.post(
        `${BASE_URL}/category/create`,
        { ...category, userId },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Erro ao criar categoria:', error);
      
      // Verifica se é um erro de duplicidade
      if (error.response?.data?.message?.includes('duplicate key value')) {
        throw new Error('Já existe uma categoria com este nome. Por favor, escolha outro nome.');
      }
      
      throw new Error('Erro ao criar categoria. Por favor, tente novamente.');
    }
  },

  async updateCategory(categoryId: string, category: Partial<Category>): Promise<Category> {
    try {
      const userId = authService.getUserId();
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }

      const response = await axios.put(
        `${BASE_URL}/category/update`,
        { ...category, id: categoryId, userId },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      throw error;
    }
  },

  async deleteCategory(categoryId: string): Promise<void> {
    try {
      const userId = authService.getUserId();
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }

      await axios.delete(`${BASE_URL}/category/delete`, {
        params: { categoryId, userId },
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
      throw error;
    }
  }
}; 