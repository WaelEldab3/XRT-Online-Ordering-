import { Transaction, CreateTransactionDTO } from '../entities/Transaction';

export interface ITransactionRepository {
  create(data: CreateTransactionDTO): Promise<Transaction>;
  findById(id: string): Promise<Transaction | null>;
  findByOrderId(orderId: string): Promise<Transaction[]>;
  findByTransactionId(transactionId: string): Promise<Transaction | null>;
  findAll(filters: any): Promise<{ data: Transaction[]; total: number }>;
  delete(id: string): Promise<boolean>;
}
