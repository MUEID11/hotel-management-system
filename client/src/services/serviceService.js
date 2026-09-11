import { apiGet, apiPost, apiPut } from './apiClient.js';

export function fetchServices(includeInactive = false) {
  return apiGet('/services', null, includeInactive);
}

export function createService(serviceData) {
  return apiPost('/services', serviceData);
}

export function updateService(serviceId, serviceData) {
  return apiPut(`/services/${serviceId}`, serviceData);
}

export function placeServiceOrder(orderData) {
  return apiPost('/service-orders', orderData);
}

export function fetchAllServiceOrders() {
  return apiGet('/service-orders');
}

export function updateServiceOrderStatus(orderId, status) {
  return apiPut(`/service-orders/${orderId}/status`, { status });
}