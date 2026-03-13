import { apiClient } from "./client";
import { API_ENDPOINTS } from "./endpoints";

/**
 * Create a new order via the public endpoint (no auth required).
 * @param {Object} orderPayload - The order data
 * @param {Object} orderPayload.customer - { name, email, phone }
 * @param {string} orderPayload.order_type - 'pickup' | 'delivery'
 * @param {string} orderPayload.service_time_type - 'ASAP' | 'Schedule'
 * @param {Object} orderPayload.money - { subtotal, discount, delivery_fee, tax_total, tips, total_amount, currency, payment }
 * @param {Object} [orderPayload.delivery] - { name, phone, address }
 * @param {string} [orderPayload.notes]
 * @param {Array} orderPayload.items - Order items array
 * @returns {Promise} Created order
 */
export function createOrder(orderPayload) {
  return apiClient
    .post(API_ENDPOINTS.PUBLIC_ORDERS, orderPayload)
    .then((res) => res.data);
}

export function getIframeToken(data) {
  return apiClient
    .post(API_ENDPOINTS.PUBLIC_AUTHORIZE_NET_TOKEN, data)
    .then((res) => res.data);
}

export function getAuthorizeNetEnv() {
  return apiClient
    .get(API_ENDPOINTS.PUBLIC_AUTHORIZE_NET_ENV)
    .then((res) => res.data);
}
