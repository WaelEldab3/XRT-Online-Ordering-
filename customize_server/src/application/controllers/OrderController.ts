import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { CreateOrderUseCase } from '../../domain/usecases/order/CreateOrderUseCase';
import { GetOrderUseCase } from '../../domain/usecases/order/GetOrderUseCase';
import { GetOrdersUseCase } from '../../domain/usecases/order/GetOrdersUseCase';
import { UpdateOrderStatusUseCase } from '../../domain/usecases/order/UpdateOrderStatusUseCase';
import { DeleteOrderUseCase } from '../../domain/usecases/order/DeleteOrderUseCase';
import { OrderRepository } from '../../infrastructure/repositories/OrderRepository';
import { ItemRepository } from '../../infrastructure/repositories/ItemRepository';
import { CategoryRepository } from '../../infrastructure/repositories/CategoryRepository';
import { sendSuccess } from '../../shared/utils/response';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { ValidationError, NotFoundError } from '../../shared/errors/AppError';
import { emitNewOrder } from '../../services/printer/orderPrintEvents';
import { routeOrderToPrinters } from '../../services/printer/printRoutingService';
import { PrintLogRepository } from '../../infrastructure/repositories/PrintLogRepository';
import { Server as SocketIOServer } from 'socket.io';

import { BusinessSettingsRepository } from '../../infrastructure/repositories/BusinessSettingsRepository';

export class OrderController {
  private createOrderUseCase: CreateOrderUseCase;
  private getOrderUseCase: GetOrderUseCase;
  private getOrdersUseCase: GetOrdersUseCase;
  private updateOrderStatusUseCase: UpdateOrderStatusUseCase;
  private deleteOrderUseCase: DeleteOrderUseCase;

  constructor() {
    const orderRepository = new OrderRepository();
    const itemRepository = new ItemRepository();
    const categoryRepository = new CategoryRepository();
    const businessSettingsRepository = new BusinessSettingsRepository();
    this.createOrderUseCase = new CreateOrderUseCase(
      orderRepository,
      itemRepository,
      categoryRepository,
      businessSettingsRepository
    );
    this.getOrderUseCase = new GetOrderUseCase(orderRepository);
    this.getOrdersUseCase = new GetOrdersUseCase(orderRepository);
    this.updateOrderStatusUseCase = new UpdateOrderStatusUseCase(orderRepository);
    this.deleteOrderUseCase = new DeleteOrderUseCase(orderRepository);
  }

  create = asyncHandler(async (req: AuthRequest, res: Response) => {
    // In a real scenario, customer_id might come from req.user if customer is logging in
    const customer_id = req.user?.id || req.body.customer_id;

    if (!customer_id) {
      throw new ValidationError('customer_id is required');
    }

    const orderData = {
      ...req.body,
      customer_id,
    };

    const order = await this.createOrderUseCase.execute(orderData);
    const payload = { orderId: order.id, orderNumber: order.order_number };
    emitNewOrder(payload);
    const socketIo = req.app.get('io') as SocketIOServer | undefined;
    if (socketIo) socketIo.emit('new-order', order);
    return sendSuccess(res, 'Order created successfully', order, 201);
  });

  getAll = asyncHandler(async (req: AuthRequest, res: Response) => {
    const statusParam = req.query.status as string | undefined;
    const status = statusParam
      ? statusParam.includes(',')
        ? statusParam
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : statusParam
      : undefined;
    const filters: any = {
      status,
      order_type: req.query.order_type as string,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
    };

    // If a customer is querying their own orders
    if (req.user?.role === 'customer') {
      filters.customer_id = req.user.id;
    } else if (req.query.customer_id) {
      filters.customer_id = req.query.customer_id as string;
    }

    const orders = await this.getOrdersUseCase.execute(filters);
    return sendSuccess(res, 'Orders retrieved successfully', orders);
  });

  getById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const order = await this.getOrderUseCase.execute(id);

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    // Optional: authorization check to ensure customer owns the order
    if (req.user?.role === 'customer' && order.customer_id !== req.user.id) {
      throw new NotFoundError('Order not found'); // Hide existence to unauthorized users
    }

    return sendSuccess(res, 'Order retrieved successfully', order);
  });

  updateStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { status, cancelled_reason, cancelled_by, ready_time, clear_schedule } = req.body;

    if (!status) {
      throw new ValidationError('Status is required');
    }

    const order = await this.updateOrderStatusUseCase.execute(id, {
      status,
      ready_time: ready_time ? new Date(ready_time) : undefined,
      clear_schedule: !!clear_schedule,
      cancelled_reason,
      cancelled_by: cancelled_by || req.user?.role || 'system',
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    return sendSuccess(res, 'Order status updated successfully', order);
  });

  delete = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const success = await this.deleteOrderUseCase.execute(id);

    if (!success) {
      throw new NotFoundError('Order not found or already deleted');
    }

    return sendSuccess(res, 'Order deleted successfully', { deleted: true });
  });

  /** POST /orders/:id/reprint — clear print status and trigger routing again (manual reprint). */
  reprint = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id: orderId } = req.params;
    const printerId = req.body.printerId as string | undefined;

    const order = await this.getOrderUseCase.execute(orderId);
    if (!order) throw new NotFoundError('Order not found');

    const orderRepository = new OrderRepository();
    await orderRepository.clearPrintStatus(orderId, printerId);
    setImmediate(() => {
      routeOrderToPrinters(orderId).catch(() => {});
    });
    return sendSuccess(res, 'Reprint triggered', { orderId, printerId: printerId ?? 'all' });
  });

  /** GET /orders/:id/print-logs — list print attempt logs for an order. */
  getPrintLogs = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id: orderId } = req.params;
    const order = await this.getOrderUseCase.execute(orderId);
    if (!order) throw new NotFoundError('Order not found');
    const printLogRepo = new PrintLogRepository();
    const logs = await printLogRepo.findByOrderId(orderId);
    return sendSuccess(res, 'Print logs retrieved', logs);
  });
}
