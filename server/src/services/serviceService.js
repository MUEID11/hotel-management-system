import { callProcedure, callProcedureWithOut } from './procedureRunner.js';

export async function getServicesService(includeInactive = 0) {
  return callProcedure('sp_get_services', [includeInactive]);
}

export async function createServiceService(serviceData) {
  const result = await callProcedureWithOut(
    'sp_create_service',
    [serviceData.name, serviceData.description, serviceData.price],
    ['service_id']
  );
  return { serviceId: Number(result.service_id) };
}

export async function updateServiceService(serviceId, serviceData) {
  await callProcedure('sp_update_service', [
    serviceId,
    serviceData.description,
    serviceData.price,
    serviceData.isActive,
  ]);
}

export async function placeServiceOrderService(orderData) {
  const result = await callProcedureWithOut(
    'sp_place_service_order',
    [orderData.reservationId, orderData.serviceId, orderData.quantity ?? 1],
    ['order_id']
  );
  return { orderId: Number(result.order_id) };
}

export async function getServiceOrdersService(reservationId) {
  return callProcedure('sp_get_service_orders', [reservationId]);
}

export async function getAllServiceOrdersService() {
  return callProcedure('sp_get_all_service_orders', []);
}

export async function updateServiceOrderStatusService(orderId, status) {
  await callProcedure('sp_update_service_order_status', [orderId, status]);
}