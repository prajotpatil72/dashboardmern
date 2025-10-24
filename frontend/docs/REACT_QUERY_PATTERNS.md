# React Query Patterns Documentation

## Overview

This document outlines the React Query patterns and best practices used in the YouTube Analytics Dashboard project (Tasks 131-140).

---

## 📋 Table of Contents

1. [Configuration](#configuration)
2. [Query Key Patterns](#query-key-patterns)
3. [Usage Patterns](#usage-patterns)
4. [Cache Management](#cache-management)
5. [Error Handling](#error-handling)
6. [Best Practices](#best-practices)

---

## Configuration

### QueryClient Setup

Located in: `src/lib/queryClient.js`

```javascript
import { queryClient } from './lib/queryClient';

// Default cache settings
staleTime: 5 minutes  // Data stays fresh for 5 min
gcTime: 10 minutes    // Cache persists for 10 min after last use
retry: 3              // Retry failed queries 3 times
```

### Cache Presets

Different data types have different cache strategies:

```javascript
import { queryOptions } from './lib/queryClient';

// Realtime data (2 min stale, 5 min cache)
queryOptions.realtime

// Stable data (10 min stale, 30 min cache)
queryOptions.stable

// Long-lived data (30 min stale, 1 hour cache)
queryOptions.longLived

// Always fresh (0 stale, 5 min cache)
queryOptions.alwaysFresh
```

---

## Query Key Patterns

### Structure

All query keys follow this pattern:

```
['resource', 'type', ...identifiers, filters]
```

### Examples

```javascript
import { queryKeys } from './constants/queryKeys';

// YouTube search
queryKeys.youtube.search('videos', 'react tutorial', { order: 'date' })
// ['youtube', 'search', 'videos', 'react tutorial', { order: 'date' }]

// Single video
queryKeys.youtube.video('dQw4w9WgXcQ')
// ['youtube', 'video', 'dQw4w9WgXcQ']

// Multiple videos
queryKeys.youtube.videos(['id1', 'id2', 'id3'])
// ['youtube', 'videos', 'id1,id2,id3']

// Trending videos
queryKeys.youtube.trending('US', 'gaming')
// ['youtube', 'trending', 'US', 'gaming']

// User quota
queryKeys.user.quota()
// ['user', 'quota']
```

### Creating Search Keys

```javascript
import { queryKeyUtils } from './constants/queryKeys';

// With validation
const key = queryKeyUtils.createSearchKey('videos', 'React Hooks', {
  order: 'relevance',
  duration: 'medium',
});
```

---

## Usage Patterns

### 1. Basic Query

```javascript
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './constants/queryKeys';
import { youtubeAPI } from './services/api';

function VideoSearch({ query }) {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.youtube.search('videos', query),
    queryFn: () => youtubeAPI.searchVideos({ q: query }),
    enabled: !!query, // Only run if query exists
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{/* Render data */}</div>;
}
```

### 2. Query with Custom Cache Settings

```javascript
import { queryOptions } from './lib/queryClient';

const { data } = useQuery({
  queryKey: queryKeys.youtube.trending('US'),
  queryFn: () => youtubeAPI.getTrending('US'),
  ...queryOptions.realtime, // 2 min cache for realtime data
});
```

### 3. Dependent Queries

```javascript
// First query
const { data: video } = useQuery({
  queryKey: queryKeys.youtube.video(videoId),
  queryFn: () => youtubeAPI.getVideo(videoId),
});

// Dependent query (only runs after first query succeeds)
const { data: channel } = useQuery({
  queryKey: queryKeys.youtube.channel(video?.channelId),
  queryFn: () => youtubeAPI.getChannel(video.channelId),
  enabled: !!video?.channelId, // Only run if we have channelId
});
```

### 4. Mutation with Cache Update

```javascript
import { useMutation, useQueryClient } from '@tanstack/react-query';

function AddFavorite() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (videoId) => api.post('/favorites', { videoId }),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.user.favorites() 
      });
    },
  });

  return (
    <button onClick={() => mutation.mutate('videoId')}>
      Add to Favorites
    </button>
  );
}
```

### 5. Prefetching Data

```javascript
import { prefetchQuery } from './lib/queryClient';
import { queryKeys } from './constants/queryKeys';

// Prefetch on hover
function VideoCard({ videoId }) {
  const handleMouseEnter = async () => {
    await prefetchQuery(
      queryKeys.youtube.video(videoId),
      () => youtubeAPI.getVideo(videoId)
    );
  };

  return <div onMouseEnter={handleMouseEnter}>...</div>;
}
```

### 6. Infinite Queries (Pagination)

```javascript
import { useInfiniteQuery } from '@tanstack/react-query';

function InfiniteVideoList({ query }) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: queryKeys.youtube.search('videos', query),
    queryFn: ({ pageParam = '' }) =>
      youtubeAPI.searchVideos({ q: query, pageToken: pageParam }),
    getNextPageParam: (lastPage) => lastPage.nextPageToken,
    initialPageParam: '',
  });

  return (
    <div>
      {data?.pages.map((page) => (
        // Render page items
      ))}
      <button
        onClick={() => fetchNextPage()}
        disabled={!hasNextPage || isFetchingNextPage}
      >
        Load More
      </button>
    </div>
  );
}
```

---

## Cache Management

### Invalidating Queries

```javascript
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './constants/queryKeys';

const queryClient = useQueryClient();

// Invalidate all YouTube queries
queryClient.invalidateQueries({ 
  queryKey: queryKeys.youtube.all 
});

// Invalidate specific search
queryClient.invalidateQueries({ 
  queryKey: queryKeys.youtube.search('videos', 'react') 
});

// Invalidate with predicate
queryClient.invalidateQueries({
  predicate: (query) => 
    query.queryKey[0] === 'youtube' && query.queryKey[1] === 'search',
});
```

### Manual Cache Updates

```javascript
import { setQueryData, getQueryData } from './lib/queryClient';

// Set data manually
setQueryData(queryKeys.user.quota(), { remaining: 95, total: 100 });

// Get cached data
const cachedQuota = getQueryData(queryKeys.user.quota());

// Update existing data
queryClient.setQueryData(queryKeys.user.quota(), (old) => ({
  ...old,
  remaining: old.remaining - 1,
}));
```

### Clear All Cache

```javascript
import { clearCache } from './lib/queryClient';

// Clear entire cache (use sparingly)
clearCache();
```

---

## Error Handling

### Query-Level Error Handling

```javascript
const { data, error, isError } = useQuery({
  queryKey: queryKeys.youtube.video(videoId),
  queryFn: () => youtubeAPI.getVideo(videoId),
  retry: 3,
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
});

if (isError) {
  return <ErrorComponent error={error} />;
}
```

### Global Error Handling

```javascript
import { QueryCache } from '@tanstack/react-query';

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      console.error('Global query error:', error);
      // Show toast notification
      if (error.response?.status === 429) {
        toast.error('Rate limit exceeded');
      }
    },
  }),
});
```

### Error Boundaries

```javascript
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';

<QueryErrorResetBoundary>
  {({ reset }) => (
    <ErrorBoundary
      onReset={reset}
      fallbackRender={({ resetErrorBoundary }) => (
        <div>
          <p>Something went wrong!</p>
          <button onClick={resetErrorBoundary}>Try again</button>
        </div>
      )}
    >
      <App />
    </ErrorBoundary>
  )}
</QueryErrorResetBoundary>
```

---

## Best Practices

### ✅ Do's

1. **Use Query Keys Consistently**
   ```javascript
   // Good: Use query key factory
   queryKeys.youtube.video(videoId)
   
   // Bad: Hardcoded keys
   ['video', videoId]
   ```

2. **Enable Queries Conditionally**
   ```javascript
   useQuery({
     queryKey: queryKeys.youtube.video(videoId),
     queryFn: () => youtubeAPI.getVideo(videoId),
     enabled: !!videoId, // Only run when videoId exists
   });
   ```

3. **Use Appropriate Cache Times**
   ```javascript
   // Frequently changing data
   ...queryOptions.realtime
   
   // Stable data
   ...queryOptions.stable
   ```

4. **Prefetch on User Intent**
   ```javascript
   // Prefetch on hover, route change, etc.
   onMouseEnter={() => prefetchQuery(...)}
   ```

5. **Invalidate Related Queries**
   ```javascript
   // After creating a favorite, invalidate favorites list
   queryClient.invalidateQueries({ 
     queryKey: queryKeys.user.favorites() 
   });
   ```

### ❌ Don'ts

1. **Don't Fetch in useEffect**
   ```javascript
   // Bad: Manual fetching
   useEffect(() => {
     fetch('/api/data').then(...)
   }, []);
   
   // Good: Use React Query
   useQuery({ queryKey: [...], queryFn: ... });
   ```

2. **Don't Ignore Stale Data**
   ```javascript
   // Bad: Setting staleTime to Infinity
   staleTime: Infinity // Data never refetches
   
   // Good: Use appropriate staleTime
   staleTime: 5 * 60 * 1000 // 5 minutes
   ```

3. **Don't Manually Manage Loading States**
   ```javascript
   // Bad: Manual loading state
   const [loading, setLoading] = useState(false);
   
   // Good: Use React Query's loading state
   const { isLoading } = useQuery(...);
   ```

4. **Don't Over-Invalidate**
   ```javascript
   // Bad: Invalidating too broadly
   queryClient.invalidateQueries({ queryKey: ['youtube'] });
   
   // Good: Invalidate specific queries
   queryClient.invalidateQueries({ 
     queryKey: queryKeys.youtube.video(videoId) 
   });
   ```

5. **Don't Ignore Error States**
   ```javascript
   // Bad: Only handling loading and success
   if (isLoading) return <Loader />;
   return <Data data={data} />;
   
   // Good: Handle all states
   if (isLoading) return <Loader />;
   if (isError) return <Error error={error} />;
   return <Data data={data} />;
   ```

---

## Query State Flow

```
IDLE → FETCHING → SUCCESS/ERROR
         ↓
      REFETCHING (if stale)
         ↓
      SUCCESS/ERROR
```

### Query Status

- `isLoading`: Initial fetch in progress
- `isFetching`: Any fetch in progress (initial or refetch)
- `isSuccess`: Query succeeded
- `isError`: Query failed
- `isStale`: Data is stale, will refetch on next trigger

---

## DevTools Usage

### Opening DevTools

- **Development Mode**: Floating button appears in bottom-right
- **Keyboard Shortcut**: Click the button to toggle

### Features

1. **Query Explorer**: See all active queries
2. **Query Details**: Inspect query state, data, and meta
3. **Mutations**: View mutation history
4. **Actions**: Manually refetch, invalidate, or remove queries
5. **Timeline**: Visual query execution timeline

### Tips

- **Filter Queries**: Use search to find specific queries
- **Stale Queries**: Red indicator shows stale data
- **Fresh Queries**: Green indicator shows fresh data
- **Inactive Queries**: Gray indicator shows cached but inactive

---

## Performance Tips

1. **Use Select to Transform Data**
   ```javascript
   const { data: videoTitles } = useQuery({
     queryKey: queryKeys.youtube.videos(ids),
     queryFn: () => youtubeAPI.getVideos(ids),
     select: (data) => data.map(v => v.title), // Only re-render if titles change
   });
   ```

2. **Structural Sharing**
   - React Query automatically applies structural sharing
   - Only changed parts trigger re-renders

3. **Parallel Queries**
   ```javascript
   // Runs in parallel automatically
   const video1 = useQuery({ ... });
   const video2 = useQuery({ ... });
   const video3 = useQuery({ ... });
   ```

4. **useQueries for Dynamic Lists**
   ```javascript
   import { useQueries } from '@tanstack/react-query';
   
   const results = useQueries({
     queries: videoIds.map(id => ({
       queryKey: queryKeys.youtube.video(id),
       queryFn: () => youtubeAPI.getVideo(id),
     })),
   });
   ```

---

## Integration with Existing Services

### YouTube API Service

```javascript
import { youtubeAPI } from './services/api';
import { queryKeys } from './constants/queryKeys';

// All API methods work seamlessly with React Query
const { data } = useQuery({
  queryKey: queryKeys.youtube.search('videos', query),
  queryFn: () => youtubeAPI.searchVideos({ q: query }),
});
```

### Token Refresh

React Query works with the automatic token refresh in `api.js`:

- Failed 401 requests automatically retry with new token
- React Query's retry logic complements API retry logic
- No additional configuration needed

### Performance Tracking

```javascript
import { performanceAPI } from './services/api';

// Track query performance
const { data: metrics } = useQuery({
  queryKey: ['performance', 'metrics'],
  queryFn: () => performanceAPI.getSummary(),
  refetchInterval: 10000, // Update every 10 seconds
});
```

---

## Testing Queries

### Unit Testing

```javascript
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

test('fetches video data', async () => {
  const { result } = renderHook(
    () => useQuery({
      queryKey: queryKeys.youtube.video('test'),
      queryFn: () => mockAPI.getVideo('test'),
    }),
    { wrapper: createWrapper() }
  );

  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data).toEqual(mockVideoData);
});
```

---

## Troubleshooting

### Query Not Refetching

**Problem**: Query doesn't refetch when expected

**Solutions**:
1. Check if data is still fresh (within `staleTime`)
2. Verify `enabled` condition is `true`
3. Ensure query key changes when it should
4. Check if `refetchOnWindowFocus` is disabled

### Stale Data Showing

**Problem**: Old data appears briefly before new data

**Solutions**:
1. This is expected behavior (React Query shows cached data while refetching)
2. Use `placeholderData` for initial state
3. Show loading indicator during refetch: `isFetching && <Spinner />`

### Too Many Requests

**Problem**: API being called too frequently

**Solutions**:
1. Increase `staleTime`
2. Disable `refetchOnWindowFocus` if not needed
3. Use `refetchInterval: false` to disable polling

### Cache Not Clearing

**Problem**: Old data persists in cache

**Solutions**:
1. Use `queryClient.invalidateQueries()` to mark as stale
2. Use `queryClient.removeQueries()` to remove from cache
3. Use `clearCache()` to reset everything (rarely needed)

---

## Resources

- [React Query Docs](https://tanstack.com/query/latest/docs/react/overview)
- [Query Keys Guide](https://tanstack.com/query/latest/docs/react/guides/query-keys)
- [Caching Examples](https://tanstack.com/query/latest/docs/react/guides/caching)
- [DevTools Guide](https://tanstack.com/query/latest/docs/react/devtools)

---

## Summary

✅ **Configured**: QueryClient with optimized cache settings  
✅ **Structured**: Consistent query key patterns  
✅ **Integrated**: Works seamlessly with existing API services  
✅ **Documented**: Comprehensive patterns and best practices  
✅ **DevTools**: Available in development for debugging  

For questions or issues, refer to this documentation or check the DevTools in development mode.
