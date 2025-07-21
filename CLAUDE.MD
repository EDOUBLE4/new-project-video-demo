```markdown
# Claude AI Development Agent Rules - IntelliCOI

You are an expert in Next.js 15, TypeScript, React 19, Supabase, Tailwind CSS, and AI integration patterns.

## Project Context
Building an AI-powered COI compliance platform with document processing and insurance intelligence capabilities. Currently in MVP phase - focus on proving 99% extraction accuracy and 10-minute time to first compliant vendor.

## Core Philosophy
Ship fast with extreme accuracy, learn from property managers, scale intelligently. Every line of code should help achieve 95% vendor compliance.

## Development Approach

### Before Coding
- **BP-1 (MUST)** Ask clarifying questions before implementing
- **BP-2 (SHOULD)** For complex features, draft approach and confirm
- **BP-3 (SHOULD)** If multiple approaches exist, list clear pros/cons
- **BP-4 (MUST)** Always ask: "Does this help property managers achieve 95% compliance faster?"
- **BP-5 (SHOULD)** Consider Vectorize.io rate limits and accuracy requirements

### Development Workflow
1. First think through the problem, read the codebase for relevant files, and write a plan to `tasks/todo.md`
2. The plan should have a list of todo items that you can check off as you complete them
3. Before you begin working, check in with me and I will verify the plan
4. Then, begin working on the todo items, marking them as complete as you go
5. Please every step of the way just give me a high level explanation of what changes you made
6. Make every task and code change you do as simple as possible. Avoid making massive or complex changes
7. Finally, add a review section to the `todo.md` file with a summary of the changes

### Example todo.md format:
```markdown
# Task: Implement COI Upload and Vectorize Processing

## Context
- Need to accept PDF/image uploads and process through Vectorize IRIS
- Must achieve 99% extraction accuracy
- Should complete in <30 seconds

## Todo Items
- [ ] Set up Supabase Storage bucket for COI documents
- [ ] Create upload component with drag-and-drop
- [ ] Implement Vectorize webhook handler
- [ ] Add extraction confidence display
- [ ] Create gap analysis logic
- [ ] Generate vendor instructions

## Review
- Implemented secure file upload to Supabase
- Vectorize processing achieves 99.2% accuracy
- Average processing time: 18 seconds
- Next steps: Add bulk upload capability
While Coding

C-1 (MUST) Follow TDD when reasonable: scaffold → test → implement
C-2 (MUST) Use insurance domain vocabulary (COI, coverage, compliance, etc.)
C-3 (SHOULD) Prefer simple functions over classes
C-4 (SHOULD) Functions should be small, testable, composable
C-5 (SHOULD) Hardcode insurance requirements initially, extract to config when needed
C-6 (SHOULD) Copy-paste similar code; only abstract after 3+ use cases
C-7 (SHOULD NOT) Add comments except for Vectorize/AI integration gotchas
C-8 (SHOULD NOT) Extract functions unless reused, aids testing, or drastically improves readability

Code Style - TypeScript

Write concise, technical TypeScript
Use branded types for IDs: type VendorId = Brand<string, 'VendorId'>
Use import type { ... } for type-only imports
Prefer type over interface unless extending
Use descriptive variable names (isCompliant, hasExpired, requiresReview)

Testing Approach

T-1 (MUST) Colocate unit tests as *.test.ts
T-2 (MUST) Separate Vectorize integration tests from unit tests
T-3 (SHOULD) Focus on COI extraction accuracy tests first
T-4 (SHOULD) Test with real insurance carrier formats
T-5 (SHOULD) Test entire compliance flow in integration tests
T-6 (SHOULD) Follow Writing Tests Best Practices checklist
T-7 (SHOULD NOT) Test UI polish before core accuracy proven

MVP-Specific Patterns
typescript// ✅ MVP: Simple and working
const requirements = {
  generalLiability: 1000000,
  workersComp: 500000,
  autoLiability: 1000000
}

// ❌ Over-engineering
class RequirementsEngine {
  private rules: ComplexRuleSet[]
  async evaluate() { /* complex logic */ }
}
Project-Specific Patterns
Vectorize Integration Patterns
typescript// Always handle Vectorize webhooks async
export async function POST(req: Request) {
  const { pipelineId, documentId, extraction } = await req.json()
  
  // Queue for processing
  await processQueue.add('process-extraction', {
    documentId,
    extraction,
    timestamp: Date.now()
  })
  
  // Return immediately
  return NextResponse.json({ received: true })
}
Compliance Analysis Patterns
typescript// Keep gap analysis simple and clear
type Gap = {
  coverageType: string
  required: number
  actual: number | null
  instruction: string
}

// Generate specific instructions
const generateInstruction = (gap: Gap): string => {
  if (!gap.actual) {
    return `Add ${gap.coverageType} coverage of at least $${gap.required.toLocaleString()}`
  }
  return `Increase ${gap.coverageType} from $${gap.actual.toLocaleString()} to $${gap.required.toLocaleString()}`
}
Database Patterns

D-1 (MUST) Use JSONB for extracted_data to handle varied formats
D-2 (SHOULD) Index vendor_id and expires_at for fast queries
D-3 (SHOULD) Use Row Level Security for multi-tenant isolation

API Design

Design for single COI upload initially
Simple JSON responses
Add batch endpoints after 100+ daily uploads
Consistent error format from start

typescripttype ApiError = {
  error: string
  code: 'EXTRACTION_FAILED' | 'INVALID_FORMAT' | 'PROCESSING_TIMEOUT'
  details?: unknown
}
Security (Even in MVP)

Supabase Auth with magic links
HTTPS everywhere
Validate file types (PDF, PNG, JPG only)
Basic rate limiting (10 uploads/minute)
Scan uploaded files for malware

Project Conventions
File Organization
src/
  app/              # Next.js app router
  components/       # UI components
  lib/             
    ai/            # Vectorize & OpenAI integrations
    db/            # Supabase queries
    compliance/    # Business logic
  types/           # TypeScript types
  utils/           # Helpers
Documentation Requirements
When implementing features, automatically create/update:

docs/api.md - API endpoints and webhooks
docs/compliance-rules.md - Insurance requirements logic
README.md - Keep updated with setup instructions

Common Patterns
Streaming AI Responses
typescript// Stream GPT-4 instructions for better UX
export async function generateInstructions(gaps: Gap[]) {
  const stream = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [...],
    stream: true
  })
  
  return new Response(stream)
}
Confidence Scoring
typescript// Always show extraction confidence
type ExtractionResult = {
  data: COIData
  confidence: number // 0-100
  warnings?: string[]
}

// Reject if confidence too low
if (result.confidence < 85) {
  return { error: 'Manual review required', confidence: result.confidence }
}
Cost Management
Development Practices

Cache Vectorize extractions for 30 days
Use GPT-3.7 for very simple formatting tasks
Batch process renewal predictions
Monitor usage with simple logging

When to Optimize Costs

Vectorize usage >$500/month
OpenAI usage >$200/month
Processing >1000 COIs/day

When to Invest in Quality
Increase code quality when:

Extraction accuracy proven >99%
10+ paying customers onboarded
Processing 100+ COIs daily
Adding team members
Enterprise features needed

Anti-Patterns to Avoid

Building generic document processor
Perfect UI before accurate extraction
Complex vendor onboarding flows
Feature parity with competitors
Ignoring extraction confidence scores

Tech Stack Defaults
Unless specified otherwise, use this stack:

Language: TypeScript 5.x
Framework: Next.js 15 (App Router)
Database: Supabase (PostgreSQL + Auth + Storage)
AI: Vectorize.io + OpenAI GPT-4
Deployment: Vercel
Email: Resend
Styling: Tailwind CSS + Shadcn/ui

Git Workflow

GH-1 (MUST) Use Conventional Commits format
GH-2 (SHOULD NOT) Refer to Claude or Anthropic in commit messages
GH-3 (SHOULD) Keep commits focused and atomic
GH-4 (MUST) Write descriptive commit messages

Commit Message Format
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
Types: feat, fix, docs, style, refactor, test, chore
Development Checklist
Before implementing features:

 Understand how it improves compliance rate
 Check Vectorize.io documentation
 Plan error handling for AI failures
 Design for sub-30 second processing
 Consider vendor confusion points
 Plan success metrics

Writing Functions Best Practices
When evaluating whether a function is good:

Can you easily follow what it's doing?
Is cyclomatic complexity reasonable?
Would common data structures make it clearer?
Are there unused parameters?
Are there unnecessary type casts?
Is it easily testable?
Are there hidden dependencies?
Is the name consistent with the codebase?

Writing Tests Best Practices
When evaluating whether a test is good:

Parameterize inputs, avoid magic numbers
Only add tests that can catch real defects
Test description matches what expect verifies
Compare to independent expectations, not function output
Follow same code standards as production
Express invariants when practical
Group related tests appropriately
Use strong assertions
Test edge cases and boundaries
Don't test what the type checker catches

Shortcuts
QNEW
"Understand all BEST PRACTICES and follow them in your code."
QPLAN
"Analyze similar Vectorize integrations and ensure your plan achieves 99% accuracy with <30 second processing."
QCODE
"Implement ensuring extraction accuracy >99% and all tests pass."
QCHECK
"Check implementation for accuracy, performance, and proper error handling."
QCHECKF
"Check all functions against Writing Functions Best Practices"
QCHECKT
"Check all tests against Writing Tests Best Practices"
QUX
"List comprehensive user scenarios for property managers and vendors"
QGIT
"Stage all changes, create a conventional commit, and push"
Project-Specific Instructions

Always prioritize extraction accuracy over UI polish
Test with real COI documents from different carriers
Monitor Vectorize webhook failures closely
Keep vendor instructions clear and actionable
Log all AI interactions for cost tracking


Remember: The goal is 95% vendor compliance in 90 days. Every feature should directly contribute to this metric.