export type Transaction = {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense' | 'investment';
  category?: string;
  date: string;
};

export type TransactionFilters = {
  type: 'all' | 'income' | 'expense' | 'investment';
  startDate: string;
  endDate: string;
};

export type ApiResponse<T = any> = {
  success: boolean;
  message: string;
  data?: T;
}; 