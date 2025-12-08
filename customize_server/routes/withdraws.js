import express from 'express';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Withdraws
 *   description: Withdraw management
 */

/**
 * @swagger
 * /withdraws:
 *   get:
 *     summary: Get all withdraws
 *     tags: [Withdraws]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/', (req, res) => {
  res.status(200).json({
    data: [],
    paginatorInfo: {
      total: 0,
      count: 0,
      currentPage: 1,
      lastPage: 1,
      perPage: 15,
    },
  });
});

export default router;
