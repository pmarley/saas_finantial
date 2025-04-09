export type CategoryType = 'income' | 'expense' | 'investment';

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  color?: string;
  icon?: string;
  isDefault?: boolean;
  userId?: string;
} 