# Phase 1: Activate Core Agents - IntelliCOI

## Goal
Get the 3 core agents working to achieve the "magic moment": Upload COI → Identify Gaps → Generate Instructions → Send to Vendor → Achieve Compliance in <10 minutes

## Current State
- ✅ **Document Processing Agent**: Working with mock (95% accuracy, 2-3 seconds)
- ❌ **Compliance Analysis Agent**: Built but needs OpenAI key
- ❌ **Communication Agent**: Built but needs OpenAI + Resend keys

## Step 1: Environment Setup (15 minutes)

### Add to .env.local:
```bash
# Existing (keep these)
NEXT_PUBLIC_SUPABASE_URL=<your-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-key>
SUPABASE_SERVICE_KEY=<your-service-key>

# Add these NEW keys:
OPENAI_API_KEY=sk-<your-openai-key>  # Get from platform.openai.com
RESEND_API_KEY=re_<your-resend-key>  # Get from resend.com

# Add for MVP testing:
SKIP_AUTH=true                        # Bypass auth temporarily
USE_MOCK_VECTORIZE=true              # Keep using mock for now
```

### Get API Keys:
1. **OpenAI**: Go to platform.openai.com → API Keys → Create new secret key
2. **Resend**: Go to resend.com → API Keys → Create API Key

## Step 2: Fix Auth Blocking (30 minutes)

### Create auth bypass middleware:
```typescript
// src/lib/auth/skip-auth.ts
export function checkAuth(request: Request) {
  if (process.env.SKIP_AUTH === 'true') {
    return { user: { id: 'test-user', email: 'test@example.com' } }
  }
  // Normal auth check here
}
```

### Update API routes to use bypass:
- `/api/instructions/route.ts` - Remove auth check
- `/api/notify/route.ts` - Remove auth check
- `/api/upload/route.ts` - Already works

## Step 3: Activate Agents (1 hour)

### 3.1 Document Processing Agent ✅
Already working! Test it:
```bash
npm run test:vectorize
# Should show: "Using mock Vectorize service for testing"
```

### 3.2 Compliance Analysis Agent 🔧
This agent compares extracted COI data to requirements and identifies gaps.

**Files involved:**
- `src/lib/compliance/gap-analysis.ts` - Core logic ✅
- `src/lib/webhooks/vectorize-processor.ts` - Triggers analysis ✅

**Test it works:**
1. Upload a COI
2. Wait for mock processing (2 seconds)
3. Check dashboard - should show gaps

### 3.3 Communication Agent 🔧
This agent generates instructions and sends emails.

**Part A: Instruction Generation (OpenAI)**
- `src/lib/ai/openai.ts` - InstructionGenerator class
- Generates 3 types:
  1. Vendor instructions (simple language)
  2. Insurance agent instructions (technical)
  3. Email template

**Part B: Email Delivery (Resend)**
- `src/lib/email/resend.ts` - Email service
- Sends compliance gaps + instructions
- Includes vendor portal link

## Step 4: Test Each Agent (30 minutes)

### Test Document Processing:
```bash
npm run dev
# Upload test-coi.pdf
# Should process in 2-3 seconds
# Check Supabase for records
```

### Test Compliance Analysis:
```bash
# After upload, check:
- Gap analysis runs automatically
- Gaps stored in database
- Dashboard shows compliance status
```

### Test Communication Agent:
```bash
# Click "Generate Instructions"
- Should see 3 tabs with instructions
- Vendor instructions (simple)
- Agent instructions (technical)
- Email preview

# Click "Send to Vendor"
- Email sends via Resend
- Includes all instructions
- Has vendor portal link
```

## Step 5: Full Flow Test (30 minutes)

### Property Manager Flow:
1. Go to http://localhost:3001
2. Upload `scripts/test-coi.pdf`
3. See gaps immediately (mock extracts with missing coverage)
4. Click "Generate Instructions"
5. Review all 3 instruction types
6. Click "Send to Vendor"
7. Confirm email sent

### Vendor Flow:
1. Check email inbox
2. See clear gap summary
3. See vendor instructions ("Call your agent and...")
4. See agent instructions ("Add CG 20 10 endorsement...")
5. Click portal link
6. Upload fixed COI
7. System shows "Compliant" ✅

## Common Issues & Fixes

### OpenAI Error: "Invalid API Key"
```bash
# Verify key in .env.local starts with sk-
# Check no extra spaces
# Restart dev server after adding
```

### Resend Error: "Unauthorized"
```bash
# Verify key starts with re_
# Check domain is verified in Resend
# Use resend.com test mode first
```

### "Not Authenticated" Errors
```bash
# Make sure SKIP_AUTH=true is set
# Restart server
# Check browser console for errors
```

## Success Checklist

### Document Processing Agent ✅
- [ ] Mock Vectorize extracts COI data
- [ ] 95% confidence score shows
- [ ] Processing takes 2-3 seconds
- [ ] Data saved to database

### Compliance Analysis Agent ✅
- [ ] Gaps identified correctly
- [ ] Shows required vs actual coverage
- [ ] Instructions are specific
- [ ] Dashboard updates immediately

### Communication Agent ✅
- [ ] Generate Instructions works
- [ ] Shows all 3 instruction types
- [ ] Email sends successfully
- [ ] Vendor receives actionable steps

### End-to-End Flow ✅
- [ ] Upload → Gaps → Instructions → Email
- [ ] Vendor can access portal
- [ ] Can upload fixed COI
- [ ] Achieves compliance <10 minutes

## Next Steps (After Phase 1 Working)

1. **Improve Instruction Quality**
   - Test with different gap scenarios
   - Refine GPT-4 prompts
   - Add carrier-specific language

2. **Add Real Vectorize**
   - Get correct org ID
   - Test with real API
   - Compare accuracy to mock

3. **Enable Authentication**
   - Implement Supabase Auth
   - Add magic links
   - Fix RLS policies

4. **Deploy to Production**
   - Set up Vercel
   - Configure env vars
   - Test with real users

## Remember MVP Rules
- RULE-5: "Get to first compliant vendor in under 10 minutes" 
- RULE-6: "99% extraction accuracy" (mock gives us 95%)
- RULE-11: "Fix instructions must be specific and actionable"
- This is the magic: AI tells vendors EXACTLY what to fix!