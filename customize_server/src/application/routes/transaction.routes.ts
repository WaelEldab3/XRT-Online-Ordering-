import { Router } from 'express';
import { TransactionController } from '../controllers/TransactionController';
import { requireAuth } from '../middlewares/auth';
import { authorizeRoles } from '../middlewares/authorize';
import { UserRole } from '../../shared/constants/roles';

const router = Router();
const transactionController = new TransactionController();

router.get('/', requireAuth, authorizeRoles(UserRole.BUSINESS_ADMIN, UserRole.SUPER_ADMIN), transactionController.getTransactions);
router.get('/:id', requireAuth, authorizeRoles(UserRole.BUSINESS_ADMIN, UserRole.SUPER_ADMIN), transactionController.getTransactionById);

export default router;
