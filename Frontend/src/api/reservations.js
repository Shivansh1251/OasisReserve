import { request } from './client';

export async function fetchReservations() {
  return request('/api/reservations');
}