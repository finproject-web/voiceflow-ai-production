-- VoiceFlow AI Database Schema
-- Run this in your Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table (links to Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  business_name TEXT,
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  status TEXT DEFAULT 'new',
  loan_amount DECIMAL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Calls table
CREATE TABLE IF NOT EXISTS calls (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  phone TEXT NOT NULL,
  status TEXT DEFAULT 'scheduled',
  outcome TEXT,
  duration INTEGER,
  call_sid TEXT,
  ai_assistant_id TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recordings table
CREATE TABLE IF NOT EXISTS recordings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  call_id UUID REFERENCES calls(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  url TEXT,
  duration INTEGER,
  transcript TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Billing table
CREATE TABLE IF NOT EXISTS billing (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  plan TEXT DEFAULT 'free',
  status TEXT DEFAULT 'active',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_leads_organization_id ON leads(organization_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_calls_organization_id ON calls(organization_id);
CREATE INDEX IF NOT EXISTS idx_calls_lead_id ON calls(lead_id);
CREATE INDEX IF NOT EXISTS idx_calls_status ON calls(status);
CREATE INDEX IF NOT EXISTS idx_recordings_organization_id ON recordings(organization_id);
CREATE INDEX IF NOT EXISTS idx_recordings_call_id ON recordings(call_id);
CREATE INDEX IF NOT EXISTS idx_billing_organization_id ON billing(organization_id);

-- Enable Row Level Security (RLS)
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
-- Temporarily disable RLS for users table to allow client-side user record creation
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all" ON organizations;
DROP POLICY IF EXISTS "Users can view their own organization" ON organizations;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Service role can insert users" ON users;
DROP POLICY IF EXISTS "Users can view leads from their organization" ON leads;
DROP POLICY IF EXISTS "Users can create leads for their organization" ON leads;
DROP POLICY IF EXISTS "Users can update leads from their organization" ON leads;
DROP POLICY IF EXISTS "Users can delete leads from their organization" ON leads;
DROP POLICY IF EXISTS "Users can view calls from their organization" ON calls;
DROP POLICY IF EXISTS "Users can create calls for their organization" ON calls;
DROP POLICY IF EXISTS "Users can update calls from their organization" ON calls;
DROP POLICY IF EXISTS "Users can view recordings from their organization" ON recordings;
DROP POLICY IF EXISTS "Users can create recordings for their organization" ON recordings;
DROP POLICY IF EXISTS "Users can view billing for their organization" ON billing;

-- RLS Policies for organizations
CREATE POLICY "Users can view their own organization"
  ON organizations FOR SELECT
  USING (
    id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- RLS Policies for users
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile"
  ON users FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (id = auth.uid());

-- Bypass RLS for service role to insert user records
CREATE POLICY "Service role can insert users"
  ON users FOR INSERT
  TO service_role
  WITH CHECK (true);

-- RLS Policies for leads
CREATE POLICY "Users can view leads from their organization"
  ON leads FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create leads for their organization"
  ON leads FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update leads from their organization"
  ON leads FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete leads from their organization"
  ON leads FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- RLS Policies for calls
CREATE POLICY "Users can view calls from their organization"
  ON calls FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create calls for their organization"
  ON calls FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update calls from their organization"
  ON calls FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- RLS Policies for recordings
CREATE POLICY "Users can view recordings from their organization"
  ON recordings FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create recordings for their organization"
  ON recordings FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- RLS Policies for billing
CREATE POLICY "Users can view billing for their organization"
  ON billing FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- Function to automatically create user record on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, first_name, last_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user record on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
