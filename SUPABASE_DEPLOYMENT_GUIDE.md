# 🚀 Supabase + Next.js SSR Deployment Guide

## ✅ What's Been Fixed

- ✅ Updated to latest `@supabase/ssr` package
- ✅ Fixed all environment variable usage (removed deprecated `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`)
- ✅ Created proper server/client/middleware utilities with latest SSR patterns
- ✅ Fixed middleware for session refresh
- ✅ Updated all API routes to use new patterns
- ✅ Added proper error handling and TypeScript types
- ✅ Created test page with server-side data fetching

---

## 📋 Environment Variables Setup

### **🔑 Required Environment Variables**

Only these TWO Supabase variables are needed:

| Variable | Where to Get | Purpose |
|----------|--------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API | Public anon key for client access |

### **📍 Where to Find Values in Supabase Dashboard**

1. Go to [supabase.com](https://supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### **❌ DEPRECATED VARIABLES (DO NOT USE)**
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` ❌
- Any other Supabase key variations ❌

---

## 🔧 Vercel Deployment Setup

### **Step 1: Add Environment Variables**

In Vercel Dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **Step 2: Deploy Settings**

- **Framework**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Node Version**: 18.x or higher

### **Step 3: Deploy**

1. Push your code to GitHub
2. Import repository in Vercel
3. Add environment variables
4. Click "Deploy"

---

## 📁 File Structure (Updated)

```
src/
├── utils/
│   └── supabase/
│       ├── server.ts      # ✅ Updated with latest SSR patterns
│       ├── client.ts      # ✅ Updated with singleton pattern
│       └── middleware.ts  # ✅ Updated for session refresh
├── middleware.ts          # ✅ Updated root middleware
├── app/
│   ├── todos/
│   │   └── page.tsx       # ✅ Test page with server-side fetching
│   └── api/
│       ├── calls/
│       │   └── route.ts   # ✅ Updated API routes
│       └── leads/
│           └── route.ts   # ✅ Updated API routes
```

---

## 🧪 Testing the Setup

### **Test Server-Side Rendering**

Visit: `https://your-domain.vercel.app/todos`

This page demonstrates:
- ✅ Server-side Supabase client usage
- ✅ Proper error handling
- ✅ TypeScript types
- ✅ Latest SSR patterns

### **Test Authentication**

1. Visit `/auth/login` - Should load without errors
2. Visit `/auth/signup` - Should load without errors
3. Visit `/dashboard` - Should redirect to login if not authenticated

---

## 🔍 Common Issues & Solutions

### **Issue: "Missing environment variables"**
**Solution**: Ensure both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set in Vercel.

### **Issue: "Supabase client not working"**
**Solution**: Check that you're using the correct import:
```typescript
// Server-side
import { createClient } from '@/utils/supabase/server'

// Client-side
import { createClient } from '@/utils/supabase/client'
```

### **Issue: "Middleware not refreshing sessions"**
**Solution**: Ensure middleware.ts is in project root and properly configured.

---

## 📊 SSR Implementation Examples

### **Server Component**
```typescript
import { createClient } from '@/utils/supabase/server'

export default async function ServerComponent() {
  const supabase = createClient()
  const { data } = await supabase.from('table').select('*')
  return <div>{data?.length} items</div>
}
```

### **Client Component**
```typescript
'use client'
import { createClient } from '@/utils/supabase/client'

export default function ClientComponent() {
  const supabase = createClient()
  // Use in event handlers or useEffect
}
```

### **API Route**
```typescript
import { createClient } from '@/utils/supabase/server'

export async function GET() {
  const supabase = createClient()
  const { data } = await supabase.from('table').select('*')
  return Response.json(data)
}
```

---

## 🎯 Production Checklist

- [ ] Environment variables set in Vercel
- [ ] Supabase project is active
- [ ] Row Level Security (RLS) configured if needed
- [ ] Database tables created
- [ ] Test pages load without errors
- [ ] Authentication flow works
- [ ] API routes respond correctly

---

## 🚨 Migration Notes

If migrating from old Supabase setup:

1. **Remove deprecated packages**: `@supabase/auth-helpers-nextjs`
2. **Update imports**: Use new utility functions
3. **Fix environment variables**: Use only the 2 required variables
4. **Test thoroughly**: Verify SSR and client-side functionality

---

## 📞 Support

If you encounter issues:

1. Check Vercel deployment logs
2. Verify environment variables in dashboard
3. Test with the `/todos` page
4. Check browser console for errors

**Your Supabase + Next.js SSR setup is now production-ready! 🎉**
