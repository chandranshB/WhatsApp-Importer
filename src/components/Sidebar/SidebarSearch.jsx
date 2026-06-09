import React from 'react';
import { Search } from 'lucide-react';

export default function SidebarSearch({ searchQuery, setSearchQuery }) {
  return (
    <div className="sidebar__search">
      <label className="search-wrap" htmlFor="search-input">
        <Search className="search-icon" size={16} />
        <input 
          type="search" 
          id="search-input" 
          className="search-input" 
          placeholder="Search chats…" 
          aria-label="Search imported chats" 
          autoComplete="off"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </label>
    </div>
  );
}
