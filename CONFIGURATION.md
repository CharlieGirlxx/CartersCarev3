# Project Configuration Guide

Comprehensive guide to configuring the CartersCarev3 project for development, testing, and production environments.

## Overview

This guide covers:
- Environment variable configuration
- Development environment setup
- Building and deployment configuration
- Troubleshooting common setup issues

## Environment Variables

### What Are Environment Variables?

Environment variables are dynamic values that configure your application without modifying code. They allow:
- Different behavior in different environments (dev, test, production)
- Secure storage of secrets and API keys
- Easy deployment configuration

### Loading Environment Variables

The project automatically loads variables from:
1. `.env.local` - Local development (Git-ignored, never committed)
2. `.env.example` - Template with all available variables
3. Process environment (from host or CI/CD system)

### Creating Your .env.local

```bash
# Copy the template
cp .env.example .env.local

# Edit with your values
nano .env.local  # macOS/Linux
# or
notepad .env.local  # Windows
```

**Important:** Never commit `.env.local` to Git!

## Variable Categories

### 1. Application Settings

```bash
NODE_ENV=development              # development, staging, production
APP_URL=http://localhost:5173     # Frontend application URL
API_URL=http://localhost:3001     # Backend API URL
```

### 2. API Configuration

```bash
API_PORT=3001                     # Which port the API listens on
API_HOST=0.0.0.0                  # Which interface to bind to
```

### 3. Database Configuration

#### PostgreSQL
```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/carterscare
DATABASE_LOG=true                 # Show SQL queries
```

#### MongoDB
```bash
MONGODB_URI=mongodb://localhost:27017/carterscare
```

### 4. Authentication & Security

```bash
AUTH_SECRET=your-random-string    # Must be 32+ characters
SESSION_SECRET=your-session-key   # Session signing key
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 5. External Services

#### Stripe (Payments)
```bash
STRIPE_PUBLIC_KEY=pk_test_...    # Public key for frontend
STRIPE_SECRET_KEY=sk_test_...    # Secret key for backend
STRIPE_WEBHOOK_SECRET=whsec_...  # Webhook signature key
```

#### Email Service
```bash
EMAIL_SERVICE=sendgrid
EMAIL_API_KEY=your-api-key
EMAIL_FROM=noreply@carterscare.com
```

#### Cloud Storage
```bash
STORAGE_TYPE=s3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=carterscare-dev
AWS_S3_REGION=us-east-1
```

### 6. Logging & Debugging

```bash
LOG_LEVEL=debug                   # error, warn, info, debug, trace
API_LOGGING=true                  # Log HTTP requests
SQL_LOGGING=false                 # Log database queries
DEBUG=true                         # Enable debug output
```

### 7. Development Tools

```bash
VITE_HMR_HOST=localhost           # Hot Module Replacement
VITE_HMR_PORT=5173
GENERATE_SOURCEMAP=true           # Source maps for debugging
```

### 8. Feature Flags

```bash
ENABLE_EXPERIMENTAL_FEATURES=false
FEATURE_NEW_DASHBOARD=true        # Enable specific features
FEATURE_DARK_MODE=true
```

## Workspace Configuration

### pnpm Workspace Structure

The `pnpm-workspace.yaml` defines the monorepo packages:

```yaml
packages:
  - artifacts/*          # Main applications
  - lib/*               # Shared libraries
  - scripts             # Utility scripts
```

### Why pnpm?

- **Fast**: Efficient dependency resolution
- **Space-efficient**: Single content-addressable store
- **Strict**: Prevents phantom dependencies
- **Monorepo-friendly**: Built-in workspace support

## TypeScript Configuration

### Type Checking

```bash
# Check all packages
./dev-setup.sh typecheck

# Check specific package
pnpm --filter @workspace/carterscare run typecheck
```

### Configuration Files

- `tsconfig.base.json` - Shared base configuration
- `tsconfig.json` - Root workspace configuration
- `artifacts/*/tsconfig.json` - Package-specific settings

## Build Configuration

### Development Build

```bash
# Start development servers with hot reloading
./dev-setup.sh dev
```

**Features:**
- Hot Module Replacement (HMR)
- Instant updates on file changes
- Detailed error messages
- Source maps for debugging

### Production Build

```bash
# Build for production
./dev-setup.sh build

# Build specific package
pnpm --filter @workspace/carterscare run build
```

**Process:**
1. TypeScript type checking
2. Bundle optimization
3. Asset minification
4. Production asset output

### Build Outputs

```
artifacts/
├── carterscare/dist/        # Vite React build
├── api-server/dist/         # Express build
└── mockup-sandbox/dist/     # Sandbox build
```

## Development Server Configuration

### Vite Configuration (CartersCare)

Location: `artifacts/carterscare/vite.config.ts`

```typescript
// Customize port, HMR, etc.
export default defineConfig({
  server: {
    port: 5173,
    host: '0.0.0.0',
  },
  // ...
})
```

### Express Configuration (API Server)

Location: `artifacts/api-server/src/index.ts`

```typescript
const port = process.env.API_PORT || 3001;
const host = process.env.API_HOST || 'localhost';

app.listen(port, host, () => {
  console.log(`Server running on ${host}:${port}`);
});
```

## Security Best Practices

### Environment Variable Security

✅ **DO:**
- Use strong, random values for secrets
- Rotate secrets regularly
- Use environment-specific values
- Document what each variable does
- Store secrets in secure team storage

❌ **DON'T:**
- Hardcode secrets in code
- Commit .env.local to Git
- Share secrets over unencrypted channels
- Use the same secret across environments
- Log sensitive values

### HTTPS in Production

```bash
# Production URL should use HTTPS
APP_URL=https://carterscare.com
API_URL=https://api.carterscare.com
```

### CORS Configuration

```bash
# Production - restrict to specific domains
CORS_ORIGINS=https://carterscare.com,https://www.carterscare.com

# Development - allow localhost
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

## Database Setup

### PostgreSQL (Recommended)

#### Install PostgreSQL

**macOS (Homebrew):**
```bash
brew install postgresql
brew services start postgresql
```

**Ubuntu/Debian:**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
```bash
# Download from https://www.postgresql.org/download/windows/
# Or use Chocolatey: choco install postgresql
```

#### Create Development Database

```bash
# Create database
createdb carterscare

# Create test database (for testing)
createdb carterscare_test

# Connect and verify
psql carterscare
```

#### Connection String Format

```
postgresql://[username][:password]@[host][:port]/[database]

Examples:
postgresql://postgres:password@localhost:5432/carterscare
postgresql://localhost/carterscare  # Using peer authentication
```

### MongoDB (Alternative)

```bash
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/carterscare

# MongoDB Atlas (Cloud)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/carterscare
```

## Testing Configuration

### Running Tests

```bash
# Run all tests
pnpm run test

# Run specific package tests
pnpm --filter @workspace/carterscare run test

# Watch mode
pnpm run test --watch
```

### Test Database

```bash
# Use separate test database
TEST_DATABASE_URL=postgresql://localhost:5432/carterscare_test
```

## Deployment Configuration

### Environment-Specific Settings

#### Development
```bash
NODE_ENV=development
DEBUG=true
LOG_LEVEL=debug
DATABASE_LOG=true
```

#### Staging
```bash
NODE_ENV=staging
DEBUG=false
LOG_LEVEL=info
DATABASE_LOG=false
```

#### Production
```bash
NODE_ENV=production
DEBUG=false
LOG_LEVEL=warn
DATABASE_LOG=false
```

### CI/CD Integration

Set environment variables in your CI/CD platform:

**GitHub Actions:**
```yaml
env:
  NODE_ENV: production
  API_URL: ${{ secrets.API_URL }}
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

**Vercel:**
1. Go to Project Settings
2. Environment Variables
3. Add variables with appropriate scopes

**GitLab CI:**
```yaml
variables:
  NODE_ENV: production
  API_URL: $API_URL  # Use CI/CD variable
```

## Troubleshooting

### Environment Variables Not Loading

```bash
# Verify .env.local exists
ls -la .env.local

# Check file is readable
file .env.local

# Verify format (should be KEY=value)
cat .env.local

# Test in Node.js
node -e "require('dotenv').config(); console.log(process.env.API_URL)"
```

### Port Already in Use

```bash
# Find process using port
lsof -i :5173

# Kill the process
kill -9 <PID>

# Or change port in configuration
VITE_PORT=5174 ./dev-setup.sh dev
```

### Database Connection Issues

```bash
# Test connection string
psql $DATABASE_URL

# Verify PostgreSQL is running
brew services list  # macOS
sudo systemctl status postgresql  # Linux
services.msc        # Windows

# Check database exists
createdb carterscare
```

### Missing Secrets

```bash
# Verify all required secrets are set
grep -o "process.env\.[A-Z_]*" src/**/*.ts | sort -u

# Compare with .env.local
diff <(grep "^[A-Z_]*=" .env.local | cut -d= -f1) \
     <(grep -o "process.env\.[A-Z_]*" src/**/*.ts | sed 's/.*\.//' | sort -u)
```

## Additional Resources

### Configuration Documentation
- [pnpm Workspace](https://pnpm.io/workspaces)
- [Vite Configuration](https://vitejs.dev/config/)
- [Express Configuration](https://expressjs.com/en/api/app.html)
- [TypeScript Configuration](https://www.typescriptlang.org/tsconfig)

### Environment Variables Best Practices
- [12 Factor App - Config](https://12factor.net/config)
- [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)

### Local Development Tools
- [Docker Compose](https://docs.docker.com/compose/) - For services
- [Direnv](https://direnv.net/) - Automatic .env loading

## Next Steps

1. ✅ Copy `.env.example` to `.env.local`
2. ✅ Fill in required values
3. ✅ Run `./dev-setup.sh dev`
4. ✅ Verify all servers are running
5. ✅ Access http://localhost:5173

---

**Last Updated**: May 2026
**Questions?** Check DEVELOPMENT.md for more help
