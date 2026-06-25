import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useBusinessAnalytics, usePromoterAnalytics, useAdminAnalytics } from './api';
import { apiClient } from '../../services/apiClient';
import React from 'react';

vi.mock('../../services/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
  }
}));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('Analytics API Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it('useBusinessAnalytics fetches data correctly', async () => {
    const mockData = { summary: { total_campaigns: 10 } };
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

    const { result } = renderHook(() => useBusinessAnalytics(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockData);
    expect(apiClient.get).toHaveBeenCalledWith('/analytics/business');
  });

  it('usePromoterAnalytics fetches data correctly', async () => {
    const mockData = { summary: { profile_views: 100 } };
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

    const { result } = renderHook(() => usePromoterAnalytics(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockData);
    expect(apiClient.get).toHaveBeenCalledWith('/analytics/promoter');
  });

  it('useAdminAnalytics fetches data correctly', async () => {
    const mockData = { summary: { users: 500 } };
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

    const { result } = renderHook(() => useAdminAnalytics(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockData);
    expect(apiClient.get).toHaveBeenCalledWith('/analytics/admin');
  });
});
