# Deployment Checklist

Use this checklist to deploy the JEE Timetable API to production.

## Pre-Deployment

### ✅ Environment Setup

- [ ] PostgreSQL database provisioned
- [ ] Database credentials secured
- [ ] `.env` file created with production values
- [ ] `JWT_SECRET` set to strong random value (min 32 chars)
- [ ] `REFRESH_TOKEN_SECRET` set to strong random value (min 32 chars)
- [ ] `NODE_ENV` set to `production`
- [ ] `CORS_ORIGIN` set to your frontend domain(s)
- [ ] `PORT` configured (default: 3001)

### ✅ Security

- [ ] Change default JWT secrets from `.env.example`
- [ ] Set secure CORS origins (no wildcards in production)
- [ ] Use HTTPS/TLS for API endpoints
- [ ] Use SSL for database connections
- [ ] Review Helmet.js security headers
- [ ] Set up rate limiting (optional but recommended)
- [ ] Configure firewall rules

### ✅ Database

- [ ] Run migrations: `npm run migrate:prod`
- [ ] Verify database connectivity
- [ ] Set up automated backups
- [ ] Test restore procedure
- [ ] Monitor connection pool
- [ ] Seed initial data if needed: `npm run seed`

## Deployment Options

### Option 1: Docker

```bash
# Build image
docker build -t jee-timetable-api services/api/

# Run container
docker run -d \
  -p 3001:3001 \
  --env-file services/api/.env \
  --name jee-api \
  jee-timetable-api

# Check logs
docker logs -f jee-api
```

**Checklist:**
- [ ] Docker image builds successfully
- [ ] Container starts without errors
- [ ] Health check passes: `curl http://localhost:3001/health`
- [ ] Can register a user
- [ ] Can login and get tokens

### Option 2: Node.js Server

```bash
cd services/api
npm ci --production
npm run build
npm run migrate:prod
npm start
```

**Checklist:**
- [ ] Node.js 18+ installed
- [ ] Production dependencies installed
- [ ] Build completes without errors
- [ ] Migrations applied successfully
- [ ] Server starts on correct port
- [ ] Process manager configured (PM2, systemd)

### Option 3: Cloud Platforms

#### Heroku

```bash
# Add buildpacks
heroku buildpacks:add heroku/nodejs

# Add PostgreSQL
heroku addons:create heroku-postgresql:mini

# Set environment
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_secret
heroku config:set REFRESH_TOKEN_SECRET=your_secret

# Deploy
git push heroku main

# Run migrations
heroku run npm run migrate:prod --workspace=services/api
```

#### Railway

1. Connect GitHub repository
2. Add PostgreSQL plugin
3. Set environment variables in dashboard
4. Deploy automatically on push
5. Run migrations via Railway CLI

#### Render

1. Create Web Service from GitHub repo
2. Set build command: `cd services/api && npm install && npm run build`
3. Set start command: `cd services/api && npm run migrate:prod && npm start`
4. Add PostgreSQL database
5. Configure environment variables

## Post-Deployment

### ✅ Verification

Test each endpoint:

```bash
# Health check
curl https://your-api.com/health

# Register
curl -X POST https://your-api.com/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# Login
curl -X POST https://your-api.com/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# Get schedules (use token from login)
curl https://your-api.com/v1/schedule \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Checklist:**
- [ ] Health endpoint returns healthy status
- [ ] Can register new user
- [ ] Can login with credentials
- [ ] Can refresh tokens
- [ ] Can create schedule
- [ ] Can create lesson
- [ ] WebSocket connection works
- [ ] Real-time updates arrive

### ✅ Monitoring

Set up monitoring for:
- [ ] Server uptime (UptimeRobot, Pingdom)
- [ ] Health check endpoint (`/health`)
- [ ] Error rate
- [ ] Response times
- [ ] Database connection status
- [ ] Memory usage
- [ ] CPU usage
- [ ] Disk space

### ✅ Logging

- [ ] Application logs configured
- [ ] Error tracking setup (Sentry, LogRocket)
- [ ] Log aggregation (CloudWatch, Datadog)
- [ ] Log rotation configured
- [ ] Alert thresholds set

### ✅ Backup & Recovery

- [ ] Database backup schedule
- [ ] Backup retention policy
- [ ] Recovery procedure documented
- [ ] Recovery tested
- [ ] Backup monitoring

### ✅ Documentation

- [ ] API documentation deployed
- [ ] Environment variables documented
- [ ] Deployment procedure documented
- [ ] Rollback procedure documented
- [ ] Team has access to credentials

### ✅ Client Integration

Update your Electron app or web frontend:

```javascript
// Update API_URL to production
const API_URL = 'https://your-api.com';

// For Socket.IO
const socket = io('https://your-api.com', {
  auth: { token: accessToken }
});
```

**Checklist:**
- [ ] Frontend uses production API URL
- [ ] WebSocket URL updated
- [ ] CORS origin matches frontend domain
- [ ] SSL/TLS works correctly
- [ ] Authentication flows work
- [ ] Real-time updates work

## Performance Optimization

### Optional Enhancements

- [ ] Enable gzip compression
- [ ] Set up CDN for static assets
- [ ] Add Redis caching layer
- [ ] Implement database query optimization
- [ ] Set up load balancer (if scaling)
- [ ] Configure connection pooling
- [ ] Optimize Docker image size

### Code Optimizations

```typescript
// Add compression
import compression from 'compression';
app.use(compression());

// Add rate limiting
import rateLimit from 'express-rate-limit';
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/v1/', limiter);
```

## Scaling

### Horizontal Scaling

If you need to scale to multiple instances:

- [ ] Use Redis for session store
- [ ] Configure Socket.IO with Redis adapter
- [ ] Use database connection pooling
- [ ] Set up load balancer
- [ ] Enable sticky sessions for WebSocket

```typescript
// Socket.IO with Redis
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

const pubClient = createClient({ url: 'redis://localhost:6379' });
const subClient = pubClient.duplicate();

await Promise.all([pubClient.connect(), subClient.connect()]);

io.adapter(createAdapter(pubClient, subClient));
```

## Troubleshooting

### Common Issues

**Database Connection Failed**
- Check `DATABASE_URL` format
- Verify database is running
- Check firewall rules
- Verify SSL settings

**JWT Errors**
- Ensure `JWT_SECRET` is set
- Check token expiry times
- Verify clock sync across servers

**CORS Errors**
- Check `CORS_ORIGIN` setting
- Ensure frontend URL is included
- Verify protocol (http vs https)

**WebSocket Connection Failed**
- Check WebSocket support on hosting platform
- Verify SSL/TLS certificate
- Enable sticky sessions for load balancers
- Check firewall rules for WebSocket ports

## Security Hardening

### Production Checklist

- [ ] Use environment variables for secrets
- [ ] Never commit `.env` to git
- [ ] Enable HTTPS only
- [ ] Set secure cookie flags
- [ ] Implement rate limiting
- [ ] Add request size limits
- [ ] Sanitize user input (Zod does this)
- [ ] Use parameterized queries (Prisma does this)
- [ ] Set up WAF (Web Application Firewall)
- [ ] Regular security updates
- [ ] Dependency vulnerability scanning

### Maintenance

- [ ] Schedule regular updates
- [ ] Monitor for npm vulnerabilities: `npm audit`
- [ ] Update dependencies regularly
- [ ] Review access logs
- [ ] Rotate JWT secrets periodically
- [ ] Review and revoke old tokens

## Rollback Plan

If deployment fails:

1. **Immediate Actions:**
   - Roll back to previous version
   - Restore database from backup if needed
   - Notify team

2. **Database Rollback:**
   ```bash
   # Revert migration
   npx prisma migrate resolve --rolled-back <migration_name>
   ```

3. **Code Rollback:**
   - Deploy previous working version
   - Verify health checks pass
   - Test critical paths

## Support Contacts

Document your team contacts:
- **DevOps Lead:** [Name/Contact]
- **Backend Developer:** [Name/Contact]
- **Database Admin:** [Name/Contact]
- **On-call Engineer:** [Name/Contact]

## Final Sign-off

Before marking deployment as complete:

- [ ] All tests pass
- [ ] Health check returns green
- [ ] Critical user flows tested
- [ ] Team notified of deployment
- [ ] Monitoring alerts configured
- [ ] Backup verified
- [ ] Documentation updated
- [ ] Client integration tested

---

**Deployment Date:** _______________  
**Deployed By:** _______________  
**Version:** _______________  
**Sign-off:** _______________
