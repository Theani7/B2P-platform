import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, X, Loader2, 
  LayoutDashboard, Target, Layers, 
  MessageSquare, Bell, Star, 
  Award, Briefcase, User, 
  Settings, LogOut, Shield,
  Plus, History, Clock, Globe
} from 'lucide-react';
import { useAuth } from '../../providers/AuthProvider';
import { useSearch } from '../../features/search';
import { useDebounce } from '../../hooks/useDebounce';
import { useRecentPages, useRecentCommands, Command, CommandType } from '../../features/command-palette';

const ICON_MAP: Record<string, React.ReactNode> = {
  dashboard: <LayoutDashboard size={16} />,
  campaigns: <Target size={16} />,
  applications: <Layers size={16} />,
  collaborations: <Layers size={16} />,
  messages: <MessageSquare size={16} />,
  notifications: <Bell size={16} />,
  reviews: <Star size={16} />,
  achievements: <Award size={16} />,
  portfolio: <Briefcase size={16} />,
  profile: <User size={16} />,
  settings: <Settings size={16} />,
  logout: <LogOut size={16} />,
  admin: <Shield size={16} />,
  plus: <Plus size={16} />,
  globe: <Globe size={16} />,
  search: <Search size={16} />,
  clock: <Clock size={16} />
};

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const debouncedQuery = useDebounce(query, 300);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const recentPages = useRecentPages();
  const { recentCommands, addRecentCommand, clearRecentCommands } = useRecentCommands();
  const { data: searchResults, isLoading: isSearching } = useSearch({ q: debouncedQuery });

  // Keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setActiveIndex(0);
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  // Command Lists
  const staticCommands = useMemo<Command[]>(() => {
    if (!user) return [];
    
    const cmds: Command[] = [];
    const prefix = user.role === 'BUSINESS' ? '/business' : user.role === 'PROMOTER' ? '/promoter' : '/admin';
    
    // Dashboard
    cmds.push({ id: 'nav-dashboard', title: 'Dashboard', type: 'navigation', icon: 'dashboard', action: () => navigate(`${prefix}/dashboard`) });

    if (user.role === 'ADMIN') {
      cmds.push({ id: 'nav-users', title: 'Users Management', type: 'navigation', icon: 'profile', action: () => navigate('/admin/users') });
      cmds.push({ id: 'nav-verification', title: 'Verification Requests', type: 'navigation', icon: 'shield', action: () => navigate('/admin/verification') });
      cmds.push({ id: 'nav-campaigns', title: 'Campaign Moderation', type: 'navigation', icon: 'campaigns', action: () => navigate('/admin/campaigns') });
      cmds.push({ id: 'nav-reviews', title: 'Review Moderation', type: 'navigation', icon: 'reviews', action: () => navigate('/admin/reviews') });
      cmds.push({ id: 'nav-analytics', title: 'Analytics', type: 'navigation', icon: 'dashboard', action: () => navigate('/admin/analytics') });
      cmds.push({ id: 'nav-audit-logs', title: 'Audit Logs', type: 'navigation', icon: 'clock', action: () => navigate('/admin/audit-logs') });
      cmds.push({ id: 'nav-settings', title: 'Platform Settings', type: 'navigation', icon: 'settings', action: () => navigate('/admin/settings') });
    } else if (user.role === 'BUSINESS') {
      cmds.push({ id: 'nav-campaigns', title: 'Campaigns', type: 'navigation', icon: 'campaigns', action: () => navigate('/business/campaigns') });
      cmds.push({ id: 'action-create-campaign', title: 'Create Campaign', type: 'action', icon: 'plus', action: () => navigate('/business/campaigns/create') });
      cmds.push({ id: 'action-marketplace', title: 'Find Promoters', type: 'navigation', icon: 'globe', action: () => navigate('/business/promoters') });
      cmds.push({ id: 'nav-saved', title: 'Saved Promoters', type: 'navigation', icon: 'portfolio', action: () => navigate('/business/saved-promoters') });
      cmds.push({ id: 'nav-collaborations', title: 'Collaborations', type: 'navigation', icon: 'collaborations', action: () => navigate('/business/collaborations') });
      cmds.push({ id: 'nav-invitations', title: 'Invitations', type: 'navigation', icon: 'applications', action: () => navigate('/business/invitations') });
      cmds.push({ id: 'nav-messages', title: 'Messages', type: 'navigation', icon: 'messages', action: () => navigate('/messages') });
      cmds.push({ id: 'nav-notifications', title: 'Notifications', type: 'navigation', icon: 'notifications', action: () => navigate('/notifications') });
    } else if (user.role === 'PROMOTER') {
      cmds.push({ id: 'nav-marketplace', title: 'Marketplace', type: 'navigation', icon: 'globe', action: () => navigate('/promoter/marketplace') });
      cmds.push({ id: 'nav-applications', title: 'Applications', type: 'navigation', icon: 'applications', action: () => navigate('/promoter/applications') });
      cmds.push({ id: 'nav-invitations', title: 'Invitations', type: 'navigation', icon: 'applications', action: () => navigate('/promoter/invitations') });
      cmds.push({ id: 'nav-collaborations', title: 'Collaborations', type: 'navigation', icon: 'collaborations', action: () => navigate('/promoter/collaborations') });
      cmds.push({ id: 'nav-reviews', title: 'My Reviews', type: 'navigation', icon: 'reviews', action: () => navigate('/my/reviews') });
      cmds.push({ id: 'nav-messages', title: 'Messages', type: 'navigation', icon: 'messages', action: () => navigate('/messages') });
      cmds.push({ id: 'nav-notifications', title: 'Notifications', type: 'navigation', icon: 'notifications', action: () => navigate('/notifications') });
    }
    
    // Quick Actions
    cmds.push({ id: 'action-logout', title: 'Logout', type: 'action', icon: 'logout', action: () => logout() });
    
    return cmds;
  }, [user, navigate, logout]);

  // Filter commands by query
  const filteredCommands = useMemo(() => {
    if (!query) return [];
    const q = query.toLowerCase();
    return staticCommands.filter(c => 
      c.title.toLowerCase().includes(q) || 
      c.id.toLowerCase().includes(q) ||
      (c.keywords && c.keywords.some(kw => kw.includes(q)))
    );
  }, [query, staticCommands]);

  // Map API search results to commands
  const searchResultCommands = useMemo<Command[]>(() => {
    if (!searchResults || query.length < 2) return [];
    
    const cmds: Command[] = [];
    const mapItems = (items: any[], typeName: string, iconKey: string) => {
      items?.forEach(item => {
        cmds.push({
          id: `search-${item.id}`,
          title: item.title,
          subtitle: `${typeName} • ${item.subtitle || ''}`,
          type: 'search',
          icon: iconKey,
          action: () => navigate(item.url)
        });
      });
    };
    
    mapItems(searchResults.campaigns, 'Campaign', 'campaigns');
    mapItems(searchResults.promoters, 'Creator', 'profile');
    mapItems(searchResults.businesses, 'Brand', 'briefcase');
    mapItems(searchResults.collaborations, 'Collaboration', 'collaborations');
    
    return cmds;
  }, [searchResults, query, navigate]);

  // Assemble all flat items for keyboard nav
  const activeItems = useMemo<Command[]>(() => {
    if (query.length >= 2) {
      return [...filteredCommands, ...searchResultCommands];
    } else {
      // Default view: Recent Pages, Quick Actions, Nav
      const recents: Command[] = recentPages.map(rp => ({
        id: `recent-page-${rp.path}`,
        title: rp.title,
        subtitle: rp.path,
        type: 'recent_page',
        icon: 'clock',
        action: () => navigate(rp.path)
      }));
      
      const recentCmds = recentCommands
        .map(id => staticCommands.find(c => c.id === id))
        .filter(Boolean) as Command[];
      
      return [...recentCmds, ...recents, ...staticCommands.filter(c => c.type === 'action'), ...staticCommands.filter(c => c.type === 'navigation')];
    }
  }, [query, filteredCommands, searchResultCommands, recentPages, recentCommands, staticCommands, navigate]);

  // Handle keyboard nav inside palette
  useEffect(() => {
    setActiveIndex(0);
  }, [activeItems.length, query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev + 1) % activeItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev - 1 + activeItems.length) % activeItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeItems[activeIndex]) {
        executeCommand(activeItems[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  const executeCommand = (cmd: Command) => {
    addRecentCommand(cmd.id);
    cmd.action();
    setIsOpen(false);
  };

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector('[data-active="true"]') as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [activeIndex]);

  return (
    <>
      <div 
        className="flex items-center gap-2 px-3 py-1.5 bg-sky-wash rounded-inputs cursor-text hover:bg-slate-custom/5 transition-colors w-full sm:w-96"
        onClick={() => setIsOpen(true)}
      >
        <Search size={16} className="text-ash flex-shrink-0" />
        <span className="text-sm text-ash flex-1 text-left truncate">Search or type a command...</span>
        <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded border bg-white shadow-product-card-sm text-xs text-ash font-mono">
          <span className="text-[10px]">⌘</span>K
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] sm:pt-[15vh] px-4 pb-4">
          <div className="fixed inset-0 bg-graphite/40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          
          <div className="relative w-full max-w-2xl bg-white rounded-cards-lg shadow-product-card-product-card border border-slate-custom/10 overflow-hidden flex flex-col max-h-[80vh]">
            
            {/* Input Header */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-custom/10">
              <Search size={20} className="text-ash" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="What do you need?"
                className="flex-1 bg-transparent border-none outline-none text-lg placeholder:text-fog text-graphite"
              />
              {isSearching && <Loader2 size={18} className="text-signal-blue animate-spin" />}
              {query && !isSearching && (
                <button onClick={() => setQuery('')} className="p-1 rounded bg-sky-wash hover:bg-slate-custom/10 text-ash text-xs font-semibold px-2">
                  Clear
                </button>
              )}
            </div>

            {/* List Body */}
            <div ref={listRef} className="flex-1 overflow-y-auto p-2 min-h-[300px]">
              {activeItems.length === 0 ? (
                <div className="py-12 text-center text-ash">
                  <p>No results found for "{query}"</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {activeItems.map((cmd, idx) => (
                    <div
                      key={cmd.id + idx}
                      data-active={idx === activeIndex}
                      onClick={() => executeCommand(cmd)}
                      onMouseEnter={() => setActiveIndex(idx)}
                      className={`flex items-center gap-3 px-3 py-3 rounded-inputs cursor-pointer transition-colors ${
                        idx === activeIndex ? 'bg-sky-wash border border-slate-custom/10' : 'hover:bg-sky-wash border border-transparent'
                      }`}
                    >
                      <div className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-inputs bg-white shadow-product-card-sm border ${idx === activeIndex ? 'text-signal-blue border-signal-blue/20' : 'text-ash border-slate-custom/10'}`}>
                        {cmd.icon ? ICON_MAP[cmd.icon] || <Search size={16} /> : <Search size={16} />}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <span className={`text-sm font-medium truncate ${idx === activeIndex ? 'text-signal-blue' : 'text-graphite'}`}>
                          {cmd.title}
                        </span>
                        {cmd.subtitle && (
                          <span className="text-xs text-fog truncate">{cmd.subtitle}</span>
                        )}
                      </div>
                      <div className="flex-shrink-0 flex items-center">
                        <span className="text-xs text-fog uppercase tracking-wider font-semibold">
                          {cmd.type.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="px-4 py-3 bg-linen-canvas border-t border-slate-custom/10 text-xs text-ash flex justify-between items-center">
              <div className="flex gap-4">
                <span className="flex items-center gap-1"><kbd className="bg-white border border-slate-custom/10 rounded px-1.5 py-0.5 font-mono shadow-product-card-sm">↑↓</kbd> to navigate</span>
                <span className="flex items-center gap-1"><kbd className="bg-white border border-slate-custom/10 rounded px-1.5 py-0.5 font-mono shadow-product-card-sm">↵</kbd> to select</span>
                <span className="flex items-center gap-1"><kbd className="bg-white border border-slate-custom/10 rounded px-1.5 py-0.5 font-mono shadow-product-card-sm">esc</kbd> to close</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-ash">Byparsathy Palette</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
