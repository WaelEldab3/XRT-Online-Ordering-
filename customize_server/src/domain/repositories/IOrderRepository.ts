import { Order, CreateOrderDTO, UpdateOrderStatusDTO, OrderStatus } from '../entities/Order';

export interface IOrderRepository {
  create(order: CreateOrderDTO): Promise<Order>;
  findById(id: string): Promise<Order | null>;
  findByOrderNumber(orderNumber: string): Promise<Order | null>;
  findAll(filters: any): Promise<{ data: Order[]; total: number }>;
  findByCustomerId(customerId: string, filters: any): Promise<{ data: Order[]; total: number }>;
  updateStatus(id: string, updateData: UpdateOrderStatusDTO): Promise<Order | null>;
  updatePrintStatus(
    orderId: string,
    printerId: string,
    status: 'sent' | 'failed',
    error?: string
  ): Promise<Order | null>;
  /** Clear print_status for manual reprint: one printer or all. */
  clearPrintStatus(orderId: string, printerId?: string): Promise<Order | null>;
  delete(id: string): Promise<boolean>;
}
