import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { RecentPage } from './types';

const RECENT_PAGES_KEY = 'b2p_recent_pages';
const RECENT_COMMANDS_KEY = 'b2p_recent_commands';
const MAX_ITEMS = 10;

export function useRecentPages() {
  const location = useLocation();
  const [recentPages, setRecentPages] = useState<RecentPage[]>(() => {
    try {
      const stored = localStorage.getItem(RECENT_PAGES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Track page visits automatically
  useEffect(() => {
    // Avoid tracking the exact same page twice in a row, or modals
    const path = location.pathname;
    const title = getTitleForPath(path);
    
    if (title) {
      setRecentPages(prev => {
        const filtered = prev.filter(p => p.path !== path);
        const updated = [{ path, title, timestamp: Date.now() }, ...filtered].slice(0, MAX_ITEMS);
        localStorage.setItem(RECENT_PAGES_KEY, JSON.stringify(updated));
        return updated;
      });
    }
  }, [location.pathname]);

  return recentPages;
}

export function useRecentCommands() {
  const [recentCommands, setRecentCommands] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(RECENT_COMMANDS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const addRecentCommand = useCallback((commandId: string) => {
    setRecentCommands(prev => {
      const filtered = prev.filter(id => id !== commandId);
      const updated = [commandId, ...filtered].slice(0, MAX_ITEMS);
      localStorage.setItem(RECENT_COMMANDS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearRecentCommands = useCallback(() => {
    setRecentCommands([]);
    localStorage.removeItem(RECENT_COMMANDS_KEY);
  }, []);

  return { recentCommands, addRecentCommand, clearRecentCommands };
}

// Basic router mapper
function getTitleForPath(path: string): string | null {
  if (path.includes('/campaigns/create')) return 'Create Campaign';
  if (path.includes('/campaigns/')) return 'Campaign Details';
  if (path.endsWith('/campaigns')) return 'Campaigns';
  if (path.endsWith('/dashboard') || path === '/' || path === '/business' || path === '/promoter') return 'Dashboard';
  if (path.includes('/applications')) return 'Applications';
  if (path.includes('/collaborations')) return 'Collaborations';
  if (path.includes('/chat')) return 'Messages';
  if (path.includes('/notifications')) return 'Notifications';
  if (path.includes('/reviews')) return 'Reviews';
  if (path.includes('/settings')) return 'Settings';
  if (path.includes('/profile')) return 'Profile';
  if (path.includes('/portfolio')) return 'Portfolio';
  if (path.includes('/promoters')) return 'Marketplace';
  return null;
}
