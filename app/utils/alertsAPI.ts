'use client';

import { authenticatedFetch } from './auth';

const RAW = process.env.NEXT_PUBLIC_API_URL || 'https://apipearto.ashlya.com/api';
const API_BASE = RAW.replace(/\/$/, '');
const ALERTS = `${API_BASE}/user/alerts`;

export interface UserAlert {
  id: string;
  symbol: string;
  alertType: string;
  condition: string;
  targetValue: number | null;
  isActive: boolean;
  isTriggered: boolean;
  triggeredAt: string | null;
  notifyEmail: boolean;
  notifyPush: boolean;
  createdAt: string | null;
}

export async function getAlerts(): Promise<UserAlert[]> {
  const data = await authenticatedFetch<UserAlert[]>(ALERTS);
  return Array.isArray(data) ? data : [];
}

export async function createAlert(payload: {
  symbol: string;
  alertType?: string;
  condition?: string;
  targetValue: number;
  notifyEmail?: boolean;
  notifyPush?: boolean;
}): Promise<{ id: string; message: string }> {
  return authenticatedFetch<{ id: string; message: string }>(ALERTS, {
    method: 'POST',
    body: JSON.stringify({
      symbol: payload.symbol.trim().toUpperCase(),
      alertType: payload.alertType || 'price',
      condition: payload.condition || 'above',
      targetValue: payload.targetValue,
      notifyEmail: payload.notifyEmail ?? true,
      notifyPush: payload.notifyPush ?? true,
    }),
  });
}

export async function deleteAlert(id: string): Promise<{ message: string }> {
  return authenticatedFetch<{ message: string }>(`${ALERTS}/${id}`, { method: 'DELETE' });
}

export async function toggleAlert(id: string): Promise<{ isActive: boolean; message: string }> {
  return authenticatedFetch<{ isActive: boolean; message: string }>(`${ALERTS}/${id}/toggle`, {
    method: 'POST',
  });
}
