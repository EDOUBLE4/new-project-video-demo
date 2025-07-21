# Agentic-First MVP Development Rules - IntelliCOI Platform

## Core Philosophy
Ship the simplest solution that proves the core value proposition: AI can achieve 95% vendor compliance with 80% less effort. Everything else can wait.

## Project-Specific MVP Rules

### Before Coding
- **RULE-1** (MUST) Ask: "Does this help property managers achieve 95% vendor compliance faster?"
- **RULE-2** (MUST) Start with single COI upload → gap analysis → fix instructions - expand only after proving value
- **RULE-3** (SHOULD) Use existing Vectorize.io patterns - don't build custom OCR
- **RULE-4** (SHOULD NOT) Build renewal predictions before basic gap analysis works perfectly

### Document Processing
- **RULE-5** (MUST) Get to "first compliant vendor" in under 10 minutes
- **RULE-6** (MUST) 99% extraction accuracy - inaccurate data destroys trust instantly
- **RULE-7** (SHOULD) Show raw extracted data before building beautiful dashboards
- **RULE-8** (SHOULD NOT) Add multi-document comparison until single document processing is flawless

### Compliance Analysis
- **RULE-9** (SHOULD) Start with hardcoded requirements - make dynamic later
  ```bash
  # ✅ MVP: Simple requirements object
  const requirements = {
    generalLiability: { minimum: 1000000, required: true },
    autoLiability: { minimum: 1000000, required: true },
    workersComp: { minimum: 500000, required: true }
  }
  
  # ❌ Over-engineering: Complex requirement builder
  const requirementEngine = new RequirementBuilder()
    .withDynamicRules()
    .withConditionalLogic()
    .withVersioning()

RULE-10 (SHOULD) Use simple JSON for gap analysis initially
typescript// ✅ MVP: Clear, simple structure
const gaps = {
  generalLiability: {
    required: 1000000,
    actual: 500000,
    gap: 500000,
    instruction: "Increase General Liability to $1M"
  }
}

// ❌ Over-engineering: Complex gap modeling
class GapAnalysisEngine {
  async analyzeWithMLPredictions() { ... }
  async generateMultiLanguageInstructions() { ... }
}


Vendor Communication

RULE-11 (MUST) Fix instructions must be specific and actionable - that's the magic
RULE-12 (SHOULD) Organize by coverage type - vendors think in terms of policies
RULE-13 (SHOULD) Use simple email with PDF attachment
RULE-14 (SHOULD NOT) Build vendor portal login before email notifications work

AI Features

RULE-15 (SHOULD NOT) Add insurance Q&A chat in MVP - accurate extraction is enough
RULE-16 (SHOULD) Plan for Vectorize RAG pipeline but don't implement until 100+ COIs processed
RULE-17 (SHOULD) Collect renewal dates from day one for future predictions
RULE-18 (MUST) Show extraction confidence scores even without fancy UI

Dashboard & Analytics

RULE-19 (MUST) Design compliance_events table for future analytics from start
RULE-20 (SHOULD NOT) Build real-time dashboards until batch daily reports work perfectly
RULE-21 (SHOULD) Make extracted_data JSONB field extensible
RULE-22 (SHOULD NOT) Add charts/graphs in MVP - a simple compliance percentage is enough

Performance Requirements

RULE-23 (MUST) Achieve <30 second processing time from day one
RULE-24 (SHOULD) Handle 10 concurrent uploads before optimizing further
RULE-25 (SHOULD NOT) Add queuing until you see >30 second processing times
RULE-26 (MUST) Use Supabase Storage for documents from start - don't use local storage

When NOT to Follow MVP Rules
Stop following MVP rules when:

You have 10+ paying customers
Processing time exceeds 45 seconds regularly
You're processing 1000+ COIs per day
Enterprise customers need SSO/API access
Renewal predictions become the key value prop

Anti-Patterns to Avoid

Building a generic document processor: This is specifically for COIs - embrace the constraints
Perfect extraction on day 1: 99% is the goal, not 100% - have a manual fallback
Complex vendor onboarding: They didn't buy your software - make it one-click simple
Feature parity with competitors: You win on intelligence, not features
Premature optimization: 30 seconds is fast enough until you have paying customers

MVP Checklist
Week 1: Foundation

 Vectorize.io integration with test COIs
 Basic upload interface
 Supabase auth + storage setup
 Simple gap analysis logic
 Email notification system (Resend)

Week 2: Core Experience

 Vendor instruction generator (GPT-4)
 Basic compliance dashboard
 Vendor self-service page (no login)
 Extraction confidence display
 PDF export of gap analysis

Week 3: Polish

 10-minute onboarding flow
 Help documentation
 Error handling for bad COIs
 10 different carrier format tests
 Beta user feedback incorporation

Week 4: Launch Prep

 Marketing site with ROI calculator
 Pricing page with Stripe
 "Book a Demo" flow
 5 case study examples
 ProductHunt launch materials

Remember

Property managers expect accuracy above all else
The magic moment is seeing specific fix instructions
Trust is built on 99% extraction accuracy
Simple and working beats complex and planned
This is an AI compliance platform, not another COI tracker

Your MVP wins when a property manager says: "Holy shit, my vendor just became compliant in 24 hours instead of 2 weeks!"
Agent Instructions
When using these rules:

Every feature must directly contribute to 95% compliance goal
Prioritize accuracy over speed in all decisions
Keep vendor experience dead simple - they're not your customer
Show AI confidence scores to build trust
Log everything for future ML model training