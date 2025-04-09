import { Transaction } from '@/types/transaction';
import { formatCurrency } from '@/utils/format';
import { TooltipRoot, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface TransactionListProps {
  transactions: Transaction[];
}

export function TransactionList({ transactions }: TransactionListProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Data
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Descrição
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Categoria
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Valor
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(transaction.date).toLocaleDateString('pt-BR')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <TooltipRoot>
                  <TooltipTrigger asChild>
                    <span className="cursor-help">{transaction.description}</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>ID: {transaction.id}</p>
                    <p>Tipo: {transaction.type}</p>
                  </TooltipContent>
                </TooltipRoot>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {transaction.category}
              </td>
              <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${
                transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(transaction.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 