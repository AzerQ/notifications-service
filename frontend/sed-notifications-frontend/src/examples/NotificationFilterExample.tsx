/**
 * Example component demonstrating the new notification filtering system
 * This shows how to use the dynamic filtering capabilities
 */

import React, { useState } from 'react';
import { BaseNotification } from '../models/Notification';
import { useNotificationFilters } from '../hooks/useNotificationFilters';

interface NotificationFilterExampleProps {
  notifications: BaseNotification[];
}

/**
 * Example component showing dynamic notification filtering
 */
export const NotificationFilterExample: React.FC<NotificationFilterExampleProps> = ({ notifications }) => {
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedHashtag, setSelectedHashtag] = useState<string>('');
  const [showUnreadOnly, setShowUnreadOnly] = useState<boolean>(false);
  
  const {
    searchText,
    setSearchText,
    filterByType,
    filterByHashtag,
    filterByReadStatus,
    clearFilters,
    applyFilters
  } = useNotificationFilters();

  // Get unique types and hashtags for filter dropdowns
  const uniqueTypes = Array.from(new Set((notifications || []).map(n => n.type)));
  const uniqueHashtags = Array.from(
    new Set((notifications || []).flatMap(n => n.hashtags || []))
  );

  // Handle type filter
  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    clearFilters();
    if (type) {
      filterByType(type);
    }
    // Reapply other active filters
    if (selectedHashtag) {
      filterByHashtag(selectedHashtag);
    }
    if (showUnreadOnly) {
      filterByReadStatus(false);
    }
  };

  // Handle hashtag filter
  const handleHashtagChange = (hashtag: string) => {
    setSelectedHashtag(hashtag);
    clearFilters();
    if (hashtag) {
      filterByHashtag(hashtag);
    }
    // Reapply other active filters
    if (selectedType) {
      filterByType(selectedType);
    }
    if (showUnreadOnly) {
      filterByReadStatus(false);
    }
  };

  // Handle unread filter
  const handleUnreadToggle = (checked: boolean) => {
    setShowUnreadOnly(checked);
    clearFilters();
    if (checked) {
      filterByReadStatus(false);
    }
    // Reapply other active filters
    if (selectedType) {
      filterByType(selectedType);
    }
    if (selectedHashtag) {
      filterByHashtag(selectedHashtag);
    }
  };

  // Handle clear all
  const handleClearAll = () => {
    setSelectedType('');
    setSelectedHashtag('');
    setShowUnreadOnly(false);
    setSearchText('');
    clearFilters();
  };

  // Apply all filters
  const filteredNotifications = applyFilters(notifications || []);

  return (
    <div className="notification-filter-example">
      <div className="filter-controls">
        <h3>Filters</h3>
        
        {/* Search */}
        <div className="filter-item">
          <label htmlFor="search">Search:</label>
          <input
            id="search"
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search in title, content, author..."
          />
        </div>

        {/* Type filter */}
        <div className="filter-item">
          <label htmlFor="type">Type:</label>
          <select
            id="type"
            value={selectedType}
            onChange={(e) => handleTypeChange(e.target.value)}
          >
            <option value="">All Types</option>
            {uniqueTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Hashtag filter */}
        <div className="filter-item">
          <label htmlFor="hashtag">Hashtag:</label>
          <select
            id="hashtag"
            value={selectedHashtag}
            onChange={(e) => handleHashtagChange(e.target.value)}
          >
            <option value="">All Hashtags</option>
            {uniqueHashtags.map(tag => (
              <option key={tag} value={tag}>#{tag}</option>
            ))}
          </select>
        </div>

        {/* Unread only checkbox */}
        <div className="filter-item">
          <label>
            <input
              type="checkbox"
              checked={showUnreadOnly}
              onChange={(e) => handleUnreadToggle(e.target.checked)}
            />
            Unread only
          </label>
        </div>

        {/* Clear all button */}
        <button onClick={handleClearAll}>Clear All Filters</button>
      </div>

      {/* Results */}
      <div className="results">
        <h3>
          Results ({filteredNotifications.length} of {(notifications || []).length})
        </h3>
        
        {filteredNotifications.length === 0 ? (
          <p>No notifications found matching your filters.</p>
        ) : (
          <ul>
            {filteredNotifications.map(notification => (
              <li key={notification.id} className={notification.read ? 'read' : 'unread'}>
                <h4>{notification.title}</h4>
                <p>{notification.content}</p>
                <div className="meta">
                  <span className="type">{notification.type}</span>
                  {notification.author && (
                    <span className="author">by {notification.author}</span>
                  )}
                  <span className="date">
                    {new Date(notification.date).toLocaleString()}
                  </span>
                </div>
                {notification.hashtags && notification.hashtags.length > 0 && (
                  <div className="hashtags">
                    {notification.hashtags.map(tag => (
                      <span key={tag} className="hashtag">#{tag}</span>
                    ))}
                  </div>
                )}
                {notification.parameters && notification.parameters.length > 0 && (
                  <div className="parameters">
                    <strong>Additional Info:</strong>
                    <ul>
                      {notification.parameters.map((param, idx) => (
                        <li key={idx}>
                          <strong>{param.key}:</strong> {param.value}
                          {param.description && (
                            <span className="description"> ({param.description})</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default NotificationFilterExample;
