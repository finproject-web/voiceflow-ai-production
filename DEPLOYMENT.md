# Deployment Checklist

## Pre-Deployment Checklist ✅

### Environment Setup
- [ ] All secrets removed from code
- [ ] `.env.example` created with all required variables
- [ ] Proper `.gitignore` configured
- [ ] No large files (>100MB) in repository
- [ ] Build runs successfully locally

### Build Verification
- [ ] `npm install` completes without errors
- [ ] `npm run build` completes successfully
- [ ] `npm run dev` starts development server
- [ ] All API routes compile without errors
- [ ] No TypeScript errors in production build

### Security
- [ ] Environment variables properly configured
- [ ] No hardcoded secrets in source code
- [ ] API routes protected with authentication
- [ ] Database RLS policies configured
- [ ] CORS settings configured for production

## Vercel Deployment Steps

### 1. Repository Setup
```bash
git add .
git commit -m "Production ready deployment"
git push origin main
```

### 2. Vercel Configuration
1. Connect repository to Vercel
2. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Node Version: 18.x

### 3. Environment Variables
Set these in Vercel dashboard:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
VAPI_API_KEY=your_vapi_api_key
VAPI_DEFAULT_ASSISTANT_ID=your_vapi_assistant_id
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your_nextauth_secret
```

### 4. Database Setup
1. Ensure Supabase project is configured
2. Run all migrations
3. Set up RLS policies
4. Test database connections

### 5. Webhook Configuration
1. Configure Vapi webhook URL: `https://your-domain.vercel.app/api/webhooks/vapi`
2. Configure Twilio webhook URL: `https://your-domain.vercel.app/api/webhooks/twilio`
3. Test webhook endpoints

## Post-Deployment Verification

### Basic Functionality
- [ ] Homepage loads correctly
- [ ] User registration works
- [ ] User login works
- [ ] Dashboard loads
- [ ] API routes respond

### Advanced Features
- [ ] Lead creation works
- [ ] Call initiation works
- [ ] Webhooks receive data
- [ ] Analytics display correctly
- [ ] Recording playback works

### Performance & Security
- [ ] Page load times under 3 seconds
- [ ] No console errors
- [ ] HTTPS working correctly
- [ ] Authentication secure
- [ ] API rate limiting active

## Monitoring Setup

### Vercel Analytics
- [ ] Analytics enabled
- [ ] Error tracking configured
- [ ] Performance monitoring active

### External Monitoring
- [ ] Uptime monitoring configured
- [ ] Error reporting set up
- [ ] Database performance monitored

## Rollback Plan

### If Deployment Fails
1. Revert to previous working commit
2. Check environment variables
3. Verify database connections
4. Test API endpoints individually

### Emergency Contacts
- DevOps team: [contact info]
- Database admin: [contact info]
- Vercel support: [contact info]

## Troubleshooting Guide

### Common Issues
1. **Build fails**: Check environment variables and dependencies
2. **API errors**: Verify database connections and auth tokens
3. **Webhook failures**: Check webhook URLs and authentication
4. **Performance issues**: Monitor database queries and API response times

### Debug Commands
```bash
# Check build logs
vercel logs

# Check environment variables
vercel env ls

# Redeploy
vercel --prod
```

## Maintenance

### Regular Tasks
- [ ] Update dependencies monthly
- [ ] Review security quarterly
- [ ] Backup database weekly
- [ ] Monitor performance daily

### Scaling Considerations
- [ ] Database connection pooling
- [ ] CDN configuration
- [ ] Load balancing
- [ ] Caching strategies

---

**Deployment Status**: ✅ Ready for production
**Last Updated**: $(date)
