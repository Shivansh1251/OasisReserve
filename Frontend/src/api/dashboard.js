import { request } from './client';

export async function fetchDashboardOverview() {
  return request('/api/dashboard/overview');
}