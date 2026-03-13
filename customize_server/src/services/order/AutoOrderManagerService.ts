import { BusinessSettingsRepository } from '../../infrastructure/repositories/BusinessSettingsRepository';
import { OrderRepository } from '../../infrastructure/repositories/OrderRepository';
import { OrderModel } from '../../infrastructure/database/models/OrderModel';

export class AutoOrderManagerService {
  private interval: NodeJS.Timeout | null = null;
  private businessSettingsRepository: BusinessSettingsRepository;
  private orderRepository: OrderRepository;

  constructor() {
    this.businessSettingsRepository = new BusinessSettingsRepository();
    this.orderRepository = new OrderRepository();
  }

  start(intervalMs: number = 60000) {
    if (this.interval) return;
    this.interval = setInterval(() => this.processAutoOrders(), intervalMs);
    console.log(`AutoOrderManagerService started with interval: ${intervalMs}ms`);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  private async processAutoOrders() {
    try {
      const businessSettings = await this.businessSettingsRepository.findAll();

      for (const settings of businessSettings) {
        if (!settings.business) continue;

        // 1. Handle Auto-Accept
        // settings.business is the ID of the business
        if (settings.orders?.auto_accept_orders && (settings.orders.auto_accept_time ?? 0) >= 0) {
          const acceptTimeThreshold = new Date(Date.now() - (settings.orders.auto_accept_time || 0) * 60000);
          
          await OrderModel.updateMany(
            {
              business_id: settings.business,
              status: 'pending',
              order_type: { $in: settings.orders.auto_accept_order_types || [] },
              created_at: { $lte: acceptTimeThreshold }
            },
            { $set: { status: 'accepted' } }
          );
        }

        // 2. Handle Auto-Complete (Default behavior for 'ready' orders)
        // using deliveredOrderTime as the delay to move from 'ready' to 'completed'
        const completeTimeMinutes = settings.orders?.deliveredOrderTime ?? 0;
        if (completeTimeMinutes >= 0) {
          const completeTimeThreshold = new Date(Date.now() - completeTimeMinutes * 60000);

          await OrderModel.updateMany(
            {
              business_id: settings.business,
              status: 'ready',
              updated_at: { $lte: completeTimeThreshold }
            },
            { $set: { status: 'completed' } }
          );
        }
      }
    } catch (error) {
      console.error('Error in AutoOrderManagerService:', error);
    }
  }
}

export const autoOrderManager = new AutoOrderManagerService();
