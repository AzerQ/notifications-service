# Refactored Notification System

## Overview

The notification system has been refactored to follow the Backend for Frontend (BFF) paradigm, making it more universal, flexible, and extensible. The new system supports dynamic filtering without hardcoded filter logic.

## Core Concepts

### Base Notification Model

The new system is built around a universal `BaseNotification` interface:

```typescript
interface BaseNotification {
  // Required fields
  id: number | string;
  type: string;
  title: string;
  content: string;
  date: string;
  read: boolean;

  // Optional fields
  author?: string;
  actions?: NotificationAction[];
  hashtags?: string[];
  parameters?: NotificationParameter[];
}
```

#### Key Features:

1. **Type** - Universal string type (no hardcoded types required)
2. **Content** - Main notification content/description
3. **Hashtags** - Array of string tags for categorization
4. **Parameters** - Key-value-description triplets for additional metadata

### Notification Parameters

Additional metadata can be attached to notifications using the `NotificationParameter` interface:

```typescript
interface NotificationParameter {
  key: string;
  value: string;
  description: string;
}
```

Example:
```typescript
parameters: [
  {
    key: 'priority',
    value: 'high',
    description: 'Priority level of the notification'
  },
  {
    key: 'documentNumber',
    value: 'DOC-12345',
    description: 'Document reference number'
  }
]
```

## Dynamic Filtering System

The new filtering system is completely dynamic and doesn't require hardcoded filter logic.

### Filter Operators

Available operators:
- `equals` - Exact match
- `contains` - Contains substring (case-insensitive)
- `startsWith` - Starts with (case-insensitive)
- `endsWith` - Ends with (case-insensitive)
- `greaterThan` - Greater than (for dates and numbers)
- `lessThan` - Less than (for dates and numbers)
- `in` - Value in array
- `exists` - Field exists (for optional fields)

### Creating Filters

#### Using Helper Functions

```typescript
import {
  filterByType,
  filterByAuthor,
  filterByHashtag,
  filterByDateRange,
  filterByReadStatus
} from './models/NotificationFilter';

// Filter by type
const typeFilter = filterByType('document');

// Filter by author
const authorFilter = filterByAuthor('John Doe');

// Filter by hashtag
const hashtagFilter = filterByHashtag('urgent');

// Filter by date range
const dateFilter = filterByDateRange('2024-01-01T00:00:00', '2024-01-31T23:59:59');

// Filter by read status
const readFilter = filterByReadStatus(false); // unread only
```

#### Creating Custom Filters

```typescript
import { NotificationFilter, FilterCondition } from './models/NotificationFilter';

// Simple custom filter
const customFilter: NotificationFilter = {
  conditions: [
    { field: 'type', operator: 'equals', value: 'task' }
  ],
  logic: 'AND'
};

// Complex filter with multiple conditions
const complexFilter: NotificationFilter = {
  conditions: [
    { field: 'type', operator: 'equals', value: 'document' },
    { field: 'read', operator: 'equals', value: false },
    { field: 'author', operator: 'contains', value: 'John' }
  ],
  logic: 'AND' // All conditions must be true
};

// OR logic filter
const orFilter: NotificationFilter = {
  conditions: [
    { field: 'type', operator: 'equals', value: 'urgent' },
    { field: 'hashtags', operator: 'contains', value: 'critical' }
  ],
  logic: 'OR' // Any condition can be true
};
```

### Applying Filters

```typescript
import { filterNotifications, searchNotifications } from './models/NotificationFilter';

// Apply single filter
const filtered = notifications.filter(n => applyFilter(n, myFilter));

// Apply multiple filters
const multiFiltered = filterNotifications(notifications, [filter1, filter2, filter3]);

// Search across multiple fields
const searched = searchNotifications(notifications, 'search term');
```

## Using the Hook

The `useNotificationFilters` hook provides a convenient API for managing filters in React components:

```typescript
import { useNotificationFilters } from './hooks/useNotificationFilters';

function NotificationList() {
  const notifications = [...]; // Your notifications
  
  const {
    filters,
    searchText,
    addFilter,
    removeFilter,
    clearFilters,
    setSearchText,
    filterByType,
    filterByAuthor,
    filterByHashtag,
    filterByDateRange,
    filterByReadStatus,
    applyFilters
  } = useNotificationFilters();

  // Apply filters to get filtered notifications
  const filteredNotifications = applyFilters(notifications);

  return (
    <div>
      {/* Search */}
      <input
        type="text"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        placeholder="Search notifications..."
      />

      {/* Quick filters */}
      <button onClick={() => filterByType('document')}>
        Documents Only
      </button>
      <button onClick={() => filterByReadStatus(false)}>
        Unread Only
      </button>
      <button onClick={clearFilters}>
        Clear All Filters
      </button>

      {/* Display filtered notifications */}
      {filteredNotifications.map(notification => (
        <NotificationCard key={notification.id} notification={notification} />
      ))}
    </div>
  );
}
```

## Example: Creating Notifications with New Fields

```typescript
const notification: InAppNotificationData = {
  id: 1,
  type: 'document',
  subtype: 'Incoming Document',
  title: 'New Document Received',
  description: 'A new document has been received from Organization XYZ',
  content: 'A new document has been received from Organization XYZ',
  author: 'John Doe',
  date: '2024-01-15T10:30:00',
  read: false,
  starred: false,
  delegate: false,
  actions: [
    {
      name: 'approve',
      label: 'Approve',
      url: 'appactions://approveDocument?docId=123'
    }
  ],
  hashtags: ['urgent', 'document', 'approval'],
  parameters: [
    {
      key: 'documentNumber',
      value: 'DOC-2024-001',
      description: 'Document reference number'
    },
    {
      key: 'organizationName',
      value: 'Organization XYZ',
      description: 'Name of the sending organization'
    },
    {
      key: 'priority',
      value: 'high',
      description: 'Priority level'
    }
  ]
};
```

## Advanced Filtering Examples

### Filter by Custom Parameters

```typescript
// Filter notifications with specific parameter
const filter: NotificationFilter = {
  conditions: [
    {
      field: 'parameters',
      operator: 'contains',
      value: { key: 'priority', value: 'high' }
    }
  ],
  logic: 'AND'
};
```

### Combining Multiple Filters

```typescript
const filters = [
  filterByType('document'),
  filterByReadStatus(false),
  filterByDateRange('2024-01-01', '2024-01-31'),
  filterByHashtag('urgent')
];

const filteredNotifications = filterNotifications(allNotifications, filters);
```

### Dynamic Filter Building

```typescript
function buildDynamicFilters(userPreferences) {
  const filters: NotificationFilter[] = [];
  
  if (userPreferences.types.length > 0) {
    filters.push({
      conditions: [
        { field: 'type', operator: 'in', value: userPreferences.types }
      ],
      logic: 'AND'
    });
  }
  
  if (userPreferences.onlyUnread) {
    filters.push(filterByReadStatus(false));
  }
  
  if (userPreferences.authors.length > 0) {
    filters.push({
      conditions: userPreferences.authors.map(author => ({
        field: 'author',
        operator: 'contains',
        value: author
      })),
      logic: 'OR' // Match any author
    });
  }
  
  return filters;
}
```

## Migration Guide

### From Old Format to New Format

The system maintains backward compatibility through the `ExtendedNotification` interface. Existing code will continue to work.

To migrate:

1. **Add `content` field** (alias of `description`):
   ```typescript
   // Old
   { description: 'My notification text' }
   
   // New
   { 
     description: 'My notification text',
     content: 'My notification text'
   }
   ```

2. **Add optional fields** (hashtags, parameters):
   ```typescript
   {
     ...existingFields,
     hashtags: ['tag1', 'tag2'], // Optional
     parameters: [               // Optional
       { key: 'key1', value: 'value1', description: 'Description' }
     ]
   }
   ```

3. **Use new filter system**:
   ```typescript
   // Old hardcoded filter
   notifications.filter(n => n.type === 'document' && !n.read)
   
   // New dynamic filter
   const filters = [
     filterByType('document'),
     filterByReadStatus(false)
   ];
   filterNotifications(notifications, filters);
   ```

## Benefits

1. **Flexibility** - No hardcoded filter logic; filters can be built dynamically
2. **Extensibility** - Easy to add new filter operators and conditions
3. **Type Safety** - Full TypeScript support
4. **Backward Compatibility** - Existing code continues to work
5. **BFF Ready** - Designed for Backend for Frontend architecture
6. **Reusability** - Filter logic can be shared between components
7. **Testability** - Comprehensive test coverage for all filtering logic

## Testing

Run tests for the new system:

```bash
# All tests
npm test

# Model tests only
npm test -- --testPathPattern="models"

# Hook tests only
npm test -- --testPathPattern="useNotificationFilters"
```

## API Reference

See the following files for complete API documentation:
- `src/models/Notification.ts` - Base notification types
- `src/models/NotificationFilter.ts` - Filter system
- `src/hooks/useNotificationFilters.ts` - React hook for filtering
