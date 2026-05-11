# Phase 7-8: Performance Optimization & Artifact Cleanup

## Phase 7: Remove Mockup-Sandbox Artifact

The mockup-sandbox directory was used for design prototyping and should be removed from production.

### Actions

**1. Identify Artifact Location**
```bash
find /vercel/share/v0-project -type d -name "*mockup*" -o -type d -name "*sandbox*"
```

**2. Remove Sandbox Directory**
```bash
rm -rf artifacts/mockup-sandbox
```

**3. Remove Any References in Code**
```bash
grep -r "mockup-sandbox" lib/ artifacts/ --include="*.ts" --include="*.tsx" --include="*.json"
```

**4. Clean Up package.json Scripts**
- Remove any build scripts that reference sandbox
- Remove sandbox-related dependencies

**5. Verify Removal**
```bash
git status  # Confirm deletion
npm run build  # Ensure build still works
```

---

## Phase 8: Database & Query Optimization

### 8.1 Index Analysis & Creation

All new indexes were created in Phase 4 migrations. Verify in production:

```sql
-- List all indexes
SELECT indexname, tablename FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename;

-- Verify critical indexes exist
SELECT * FROM pg_indexes 
WHERE tablename IN ('participants', 'shifts', 'incidents', 'case_notes', 'users', 'audit_logs', 'documents')
ORDER BY tablename, indexname;
```

### 8.2 Query Optimization Patterns

**Pattern 1: Always Filter Soft Deletes**
```typescript
// BAD - returns deleted records
const shifts = await db.select().from(shiftsTable).where(eq(shiftsTable.participantId, id));

// GOOD - filters soft deletes
const shifts = await db
  .select()
  .from(shiftsTable)
  .where(and(
    eq(shiftsTable.participantId, id),
    isNull(shiftsTable.deletedAt)
  ));
```

**Pattern 2: Use Indexes for Common Queries**
```typescript
// Fast queries (covered by indexes):
// - Query by participantId (idx_shifts_participant)
// - Query by status (idx_shifts_status)
// - Query by date range (idx_shifts_date)

// Slow queries (without indexes):
// - Complex JOINs across tables
// - Text searches without FTS index
// - OR conditions spanning multiple columns
```

**Pattern 3: Eager Load Related Data**
```typescript
// BAD - N+1 problem
const participants = await db.select().from(participantsTable).limit(100);
for (const p of participants) {
  const staff = await db.select().from(staffTable).where(eq(staffTable.participantId, p.id));
}

// GOOD - single query with joins
const data = await db
  .select()
  .from(participantsTable)
  .leftJoin(shiftsTable, eq(participantsTable.id, shiftsTable.participantId))
  .limit(100);
```

### 8.3 Database Maintenance

**Regular Maintenance Tasks**

```sql
-- 1. Analyze table statistics (weekly)
ANALYZE;

-- 2. Vacuum to reclaim space (weekly)
VACUUM ANALYZE;

-- 3. Monitor table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- 4. Monitor index usage
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes 
ORDER BY idx_scan DESC;

-- 5. Find unused indexes
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan
FROM pg_stat_user_indexes 
WHERE idx_scan = 0 
ORDER BY pg_relation_size(indexrelid) DESC;
```

### 8.4 Query Caching Strategy

**API Response Caching**

```typescript
// Cache participant list (TTL: 5 minutes)
const getParticipants = async (skip: number, take: number) => {
  const cacheKey = `participants:${skip}:${take}`;
  const cached = await cache.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const result = await db
    .select()
    .from(participantsTable)
    .where(isNull(participantsTable.deletedAt))
    .offset(skip)
    .limit(take);

  await cache.set(cacheKey, JSON.stringify(result), 300); // 5 min TTL
  return result;
};

// Invalidate cache on mutations
const updateParticipant = async (id: number, data: any) => {
  const result = await db
    .update(participantsTable)
    .set(data)
    .where(eq(participantsTable.id, id))
    .returning();

  // Invalidate all participant cache entries
  await cache.delete('participants:*');
  
  return result[0];
};
```

### 8.5 API Pagination Best Practices

```typescript
// Use keyset pagination for large result sets (better than offset)
const getShiftsKeyset = async (participantId: number, lastId?: number, limit: number = 20) => {
  const query = db
    .select()
    .from(shiftsTable)
    .where(and(
      eq(shiftsTable.participantId, participantId),
      isNull(shiftsTable.deletedAt)
    ))
    .orderBy(shiftsTable.id);

  if (lastId) {
    query.where(gt(shiftsTable.id, lastId));
  }

  return await query.limit(limit + 1); // Fetch one extra to know if more exist
};
```

### 8.6 Bundle Size Optimization

**Frontend Optimization**

```json
{
  "build": {
    "rollupOptions": {
      "output": {
        "manualChunks": {
          "vendor": ["react", "react-dom"],
          "ui": ["@shadcn/ui/*"],
          "charts": ["recharts"],
          "date": ["date-fns"]
        }
      }
    }
  }
}
```

**Remove Unused Dependencies**

```bash
# Audit dependencies
npm audit

# Remove unused packages
npm prune --production

# Check bundle size
npm run build && npm run analyze-bundle
```

### 8.7 Connection Pool Configuration

For production databases, configure connection pooling:

```bash
# .env.production
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require&connection_limit=20&idle_timeout=30"

# For Supabase, use connection pooling
DATABASE_URL="postgresql://user:pass@host/db?pgbouncer=true"
```

### 8.8 Performance Monitoring

```typescript
// Log slow queries
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (duration > 1000) {
      console.warn(`[v0] SLOW QUERY: ${req.method} ${req.path} - ${duration}ms`);
    }
  });
  next();
});

// Monitor database performance
setInterval(async () => {
  const stats = await db.raw(
    sql`SELECT 
      mean_exec_time,
      calls,
      rows
    FROM pg_stat_statements 
    WHERE query LIKE '%SELECT%' 
    ORDER BY mean_exec_time DESC 
    LIMIT 10`
  );
  console.log('[v0] Top 10 slowest queries:', stats);
}, 3600000); // Every hour
```

---

## Implementation Checklist - Phase 7-8

- [ ] Remove mockup-sandbox directory
- [ ] Remove sandbox references from code
- [ ] Clean up package.json
- [ ] Verify all indexes created (Phase 4 migrations applied)
- [ ] Add cache middleware to API
- [ ] Implement keyset pagination for large queries
- [ ] Configure connection pooling (.env.production)
- [ ] Set up performance monitoring
- [ ] Document slow query procedures
- [ ] Create maintenance runbook
- [ ] Test build size
- [ ] Profile bundle and optimize

---

## Performance Targets - Phase 8

- Dashboard load: < 2s (Lighthouse target: 90+)
- API endpoints: < 200ms (p95)
- Database queries: < 100ms (p95)
- Bundle size: < 500KB gzipped
- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 2.5s
- Cumulative Layout Shift (CLS): < 0.1

---

## Monitoring & Alerts

Set up alerts for:
- Database query time > 500ms
- API response time > 1s
- Error rate > 1%
- Database connection pool exhaustion
- Storage usage > 80%

---

## Rollback Procedure

If optimization causes issues:

```bash
# Revert migration
psql -U postgres -d your_db < lib/db/migrations/rollback_phase4.sql

# Restore previous code
git revert <commit_hash>

# Redeploy
npm run build && npm run deploy
```

---

## Files Modified/Created in Phase 7-8

- Removed: `artifacts/mockup-sandbox/` directory
- Created: Optimization queries and monitoring scripts
- Updated: `.env.production.example` with connection pool settings
- Modified: API middleware for performance tracking
