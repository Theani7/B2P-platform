import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMyActivity, useBusinessActivity, useAdminActivity } from './api';
import apiClient from '../../services/apiClient';
import React from 'react';

vi.mock('../../services/apiClient', () => ({
  default: {
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

describe('Activity API Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it('useMyActivity fetches data correctly', async () => {
    const mockData = { items: [{ id: '1' }] };
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

    const { result } = renderHook(() => useMyActivity(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockData);
    expect(apiClient.get).toHaveBeenCalledWith('/activity/me', { params: {} });
  });

  it('useBusinessActivity fetches data correctly', async () => {
    const mockData = { items: [{ id: '2' }] };
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

    const { result } = renderHook(() => useBusinessActivity(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockData);
    expect(apiClient.get).toHaveBeenCalledWith('/activity/business', { params: {} });
  });

  it('useAdminActivity fetches data correctly', async () => {
    const mockData = { items: [{ id: '3' }] };
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

    const { result } = renderHook(() => useAdminActivity({ page: 2 }), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockData);
    expect(apiClient.get).toHaveBeenCalledWith('/activity/admin', { params: { page: 2 } });
  });
});
