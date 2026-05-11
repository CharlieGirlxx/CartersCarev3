# Carter's Care - Production Deployment Guide

## Pre-Deployment Checklist

### Environment Setup
- [ ] Production database configured (Supabase/AWS/Vercel PostgreSQL)
- [ ] All environment variables set in `.env.production`
- [ ] SSL certificates configured
- [ ] SMTP service for emails configured
- [ ] File storage service configured (Vercel Blob/AWS S3/GCS)
- [ ] Monitoring service configured (Sentry/DataDog)

### Security Verification
- [ ] All secrets in environment variables (none hardcoded)
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] CSRF protection enabled
- [ ] Security headers configured (HSTS, X-Frame-Options, etc.)
- [ ] MFA enabled for admin accounts
- [ ] Password policy enforced
- [ ] Database backups automated
- [ ] SSL/TLS enforced on all connections

### Compliance Verification
- [ ] All audit logging tables created
- [ ] Soft delete functionality tested
- [ ] Consent records framework ready
- [ ] Document expiry tracking configured
- [ ] Staff compliance tracking ready
- [ ] Access logging functional
- [ ] Privacy policy visible in app
- [ ] Terms of service agreed by users

### Performance Verification
- [ ] All database indexes created
- [ ] Connection pooling configured
- [ ] API caching implemented
- [ ] CDN configured for static assets
- [ ] Build bundle size < 500KB gzipped
- [ ] Lighthouse score > 90 on desktop
- [ ] Mobile usability tested on real devices
- [ ] Load time < 2 seconds on dashboard

### Testing Completion
- [ ] All authentication flows tested
- [ ] Rostering functionality end-to-end tested
- [ ] Incident reporting workflow tested
- [ ] Document upload/download tested
- [ ] Mobile UI tested on iOS and Android
- [ ] Safari/Firefox/Chrome compatibility verified
- [ ] Accessibility audit passed (WCAG 2.1 AA)
- [ ] Soft delete recovery tested
- [ ] Audit logs verified on all changes

---

## Database Migration Procedure

### 1. Backup Current Database
```bash
# For Supabase
supabase db backup create

# For AWS RDS
aws rds create-db-snapshot --db-instance-identifier carterscare-prod --db-snapshot-identifier carterscare-backup-$(date +%Y%m%d)

# For PostgreSQL
pg_dump dbname > carterscare_backup_$(date +%Y%m%d_%H%M%S).sql
```

### 2. Apply Schema Migrations

**Option A: Supabase (Recommended)**
```bash
# Using Supabase CLI
supabase db push

# Or manually in Supabase dashboard SQL editor:
# Copy and paste contents from:
# - lib/db/migrations/phase3_compliance_hardening.sql
# - lib/db/migrations/phase4_security_upgrades.sql
```

**Option B: AWS RDS / Vercel PostgreSQL**
```bash
# Connect to database
psql -h your-host -U your-user -d your-database

# Run migrations
\i lib/db/migrations/phase3_compliance_hardening.sql
\i lib/db/migrations/phase4_security_upgrades.sql

# Verify
\dt  # List all tables
\di  # List all indexes
```

### 3. Verify Migration Success
```sql
-- Check new tables exist
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('audit_logs', 'documents', 'consent_records', 'staff_compliance', 'access_logs')
ORDER BY tablename;

-- Check soft delete columns exist
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'participants' AND column_name = 'deleted_at';

-- Check indexes created
SELECT indexname FROM pg_indexes 
WHERE tablename IN ('participants', 'shifts', 'users') 
ORDER BY indexname;
```

---

## Application Deployment

### 1. Build Production Bundle
```bash
# Install dependencies
pnpm install

# Run production build
pnpm run build

# Verify build succeeded
ls -lh dist/  # Check bundle size
```

### 2. Deploy to Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel deploy --prod

# Verify deployment
vercel inspect <deployment-url>
```

### 3. Deploy to Docker (Alternative)
```bash
# Build Docker image
docker build -t carterscare:latest .

# Push to registry
docker tag carterscare:latest your-registry/carterscare:latest
docker push your-registry/carterscare:latest

# Deploy container
docker run -d \
  --name carterscare \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="$(openssl rand -base64 32)" \
  your-registry/carterscare:latest
```

---

## Configuration Management

### Essential Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:pass@host/dbname?sslmode=require"

# Authentication
JWT_SECRET="$(openssl rand -base64 32)"
JWT_EXPIRES_IN="7d"
SESSION_SECRET="$(openssl rand -base64 32)"

# Security
ENCRYPTION_KEY="$(openssl rand -base64 32)"
CSRF_TOKEN_SECRET="$(openssl rand -base64 32)"

# Email (for password resets, notifications)
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASSWORD="SG.xxxxx"
SMTP_FROM_EMAIL="noreply@carterscare.com.au"

# File Storage
BLOB_READ_WRITE_TOKEN="..."  # For Vercel Blob
# OR
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_S3_BUCKET="carterscare-files"

# Logging & Monitoring
SENTRY_DSN="https://key@sentry.io/project"
LOG_LEVEL="info"

# App
APP_URL="https://carterscare.com.au"
NODE_ENV="production"
```

---

## Post-Deployment Verification

### 1. Health Check
```bash
# Check app is running
curl -s https://your-app.com/health | jq .

# Expected response:
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0"
}
```

### 2. Authentication Test
```bash
# Test login flow
1. Visit login page
2. Enter test credentials
3. Verify JWT token issued
4. Check session cookie set
5. Verify audit log created
```

### 3. Database Connectivity
```bash
# Check database stats
SELECT version();
SELECT count(*) FROM pg_stat_activity WHERE datname = 'carterscare';
SELECT max(created_at) FROM users;  # Should be recent
```

### 4. Monitoring Setup
```bash
# Verify Sentry integration
sentry-cli projects list

# Check Datadog/equivalent monitoring
# Should see:
# - Application logs
# - Error tracking
# - Performance metrics
# - Uptime monitoring
```

### 5. Backup Verification
```bash
# Test restore capability (in staging first)
restore_from_backup.sh
run_smoke_tests.sh
```

---

## Monitoring & Alerting

### Critical Metrics to Monitor
1. **Application Health**
   - Error rate (target: < 0.1%)
   - Response time (target: < 500ms p95)
   - Uptime (target: 99.9%)

2. **Database Health**
   - Connection count
   - Query time (p95)
   - Replication lag
   - Storage usage

3. **Security**
   - Failed login attempts
   - Unauthorized access attempts
   - Rate limit violations

### Alert Thresholds
```
ERROR_RATE > 1%
  -> Page immediate notification
  -> Auto-rollback if available

RESPONSE_TIME > 2s (p95)
  -> Investigate slow queries
  -> Check database load
  -> Review recent deployments

DISK_USAGE > 80%
  -> Trigger cleanup job
  -> Notify ops team
  -> Plan capacity expansion

FAILED_LOGINS > 10 per minute
  -> Trigger DDoS detection
  -> Consider rate limit tightening
  -> Alert security team
```

---

## Rollback Procedure

### If Deployment Fails

**Option 1: Vercel Automatic Rollback**
```bash
# Vercel auto-rolls back if health checks fail
# Check deployment status:
vercel deployments
vercel rollback
```

**Option 2: Manual Rollback**
```bash
# Revert to previous version
git revert HEAD
git push origin main

# Redeploy
vercel deploy --prod
```

**Option 3: Database Rollback**
```bash
# Restore from backup if migrations failed
restore_from_snapshot.sh
# Restore application from previous version
```

---

## Maintenance Windows

### Scheduled Maintenance
- **Daily 2-4 AM AEST:** Automated backups, logs cleanup
- **Weekly Sunday 3-4 AM AEST:** Database optimization (VACUUM ANALYZE)
- **Monthly:** Security audits, dependency updates

### Planned Downtime
- Announce via in-app notification 48 hours before
- Schedule during low-usage periods
- Keep downtime < 15 minutes
- Have rollback plan ready

---

## Compliance & Auditing

### Regular Audits
```bash
# Daily: Check audit logs for anomalies
SELECT COUNT(*) FROM audit_logs WHERE created_at > NOW() - INTERVAL '1 day';

# Weekly: Review access logs
SELECT user_id, COUNT(*) as access_count FROM access_logs 
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY user_id ORDER BY access_count DESC;

# Monthly: Verify soft deletes not bypassed
SELECT COUNT(*) FROM participants WHERE deleted_at IS NOT NULL;
```

### Documentation Updates
- [ ] Update incident response runbook
- [ ] Update staff onboarding guide
- [ ] Update admin manual
- [ ] Update privacy policy (if needed)
- [ ] Update terms of service (if needed)

---

## Contact Information

### Support Escalation
- **Level 1:** In-app help / Chat support
- **Level 2:** Email: support@carterscare.com.au
- **Level 3:** Phone: 1300-CARE-TECH (during business hours)
- **Emergency:** On-call engineer (24/7 pager)

### Vendor Contacts
- **Database:** [Supabase/AWS/Provider support]
- **Email:** SendGrid support
- **File Storage:** [Provider] support
- **Monitoring:** [Provider] support

---

## Success Criteria - Production Ready

The system is ready for production when:

✅ All security checklist items completed
✅ All compliance requirements verified
✅ All performance targets met
✅ All test cases passed
✅ All documentation complete
✅ Monitoring and alerting configured
✅ Backup and recovery procedures tested
✅ Support processes documented and trained
✅ Regulatory compliance confirmed
✅ Stakeholder sign-off obtained

---

*Last Updated: 2024*
*Next Review: After first 30 days of production deployment*
