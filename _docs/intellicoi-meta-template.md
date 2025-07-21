# Agentic-First Software Development Meta-Guide

## How to Use These Templates with AI Coding Agents

### Overview
This guide helps AI coding agents (Claude Code, Cursor, etc.) use the provided templates to build software projects systematically. Follow this process for optimal results.

## Template Usage Order

### 1. Start with PRD (Day 1 Morning)
**File**: `product-requirements.md`
**Purpose**: Capture complete product vision and requirements
**AI Agent Actions**:
- Define user personas and problems
- Specify functional/non-functional requirements
- Create user journeys and success metrics
- Identify risks and constraints

### 2. Then Project Overview (Day 1 Afternoon)
**File**: `project-overview.md`
**Purpose**: Define the technical approach based on PRD
**AI Agent Actions**:
- Fill in all [PLACEHOLDERS] based on PRD requirements
- Generate specific technical choices
- Define clear success metrics
- Create phase-based development plan

### 3. Create Claude.md (Before Coding)
**File**: `claude.md`
**Purpose**: Define AI agent coding rules and practices
**AI Agent Actions**:
- Customize for the specific tech stack
- Add project-specific patterns
- Define testing approach
- Set up shortcuts and workflows

### 4. Apply MVP Rules (Before Coding)
**File**: `mvp-rules.md`
**Purpose**: Constrain scope and maintain focus
**AI Agent Actions**:
- Customize rules for the specific domain
- Add concrete code examples
- Define anti-patterns to avoid
- Create weekly checklists

### 5. Create User Stories (Validate Ideas)
**File**: `user-stories.md`
**Purpose**: Ensure real user value and market fit
**AI Agent Actions**:
- Write 3-5 compelling user stories
- Calculate specific value metrics
- Define customer personas
- Validate pricing strategy

### 6. Plan Deployment (Technical Architecture)
**File**: `deployment-guide.md`
**Purpose**: Define infrastructure and operations
**AI Agent Actions**:
- Choose specific technologies
- Set performance targets
- Create security measures
- Write troubleshooting guides

### 7. Prepare Scaling Guide (Future Planning)
**File**: `scaling-guide.md`
**Purpose**: Plan for growth without over-engineering
**AI Agent Actions**:
- Set specific scaling triggers
- Define migration priorities
- Estimate costs at each stage
- Create technical debt schedule

### 8. Design UI/UX Guidelines (If Applicable)
**File**: `ui-ux-guidelines.md`
**Purpose**: Define design system and patterns
**AI Agent Actions**:
- Create visual identity
- Define component library
- Set accessibility standards
- Plan responsive design

### 9. Write Website Copy (If Applicable)
**File**: `website-copy.md`
**Purpose**: Create marketing and conversion content
**AI Agent Actions**:
- Write compelling headlines
- Create feature descriptions
- Draft pricing page
- Prepare launch materials

## AI Agent Best Practices

### When Starting a New Project

1. **Read all templates first** - Understand the full structure
2. **Start with 10 questions** - Clarify ambiguities with the human
3. **Fill templates iteratively** - Don't try to be perfect initially
4. **Use concrete examples** - Replace all generic placeholders
5. **Maintain consistency** - Ensure all templates align

### Template Customization Guidelines

#### DO:
- Add domain-specific sections
- Include actual code snippets
- Use real numbers and metrics
- Add visual diagrams (mermaid/ASCII)
- Reference specific technologies

#### DON'T:
- Leave any [PLACEHOLDERS] unfilled
- Use vague descriptions
- Skip uncomfortable questions (like costs)
- Over-engineer the MVP
- Ignore user feedback loops

### Code Generation Strategy

After completing templates:

1. **Generate file structure** based on deployment guide
2. **Create interfaces/types** from project overview entities
3. **Build MVP features** following the rules strictly
4. **Add monitoring** as defined in deployment
5. **Write tests** for user story scenarios

### Example Workflow for Claude Code

```bash
# 1. Initialize project structure
mkdir [project-name]
cd [project-name]

# 2. Create template files
touch product-requirements.md
touch project-overview.md
touch claude.md
touch mvp-rules.md
touch user-stories.md
touch deployment-guide.md
touch scaling-guide.md
touch ui-ux-guidelines.md
touch website-copy.md

# 3. Fill templates based on requirements
# (AI agent fills each template)

# 4. Generate initial code structure
# Based on filled templates, create:
mkdir -p src/{components,services,utils}
mkdir -p infrastructure/{docker,k8s}
mkdir -p docs/{api,user}
mkdir -p tasks  # For todo.md files

# 5. Start building MVP
# Follow mvp-rules.md and claude.md strictly
```

## Common Patterns for Agentic Software

### 1. API-First Architecture
- Design APIs before UI
- Use OpenAPI/GraphQL schemas
- Version from day one
- Document as you build

### 2. Event-Driven Systems
- Define event schemas early
- Use message queues for scale
- Implement idempotency
- Plan for replay/debugging

### 3. AI Integration Patterns
- Separate AI calls from core logic
- Implement fallbacks
- Cache AI responses
- Monitor costs religiously

### 4. User-Facing AI Features
- Show AI thinking process
- Allow user corrections
- Implement "why" explanations
- Design for failure cases

## Prompting the AI Agent

When giving these templates to an AI agent, use prompts like:

```
"I want to build [PROJECT_DESCRIPTION]. Use the provided 
templates to plan this project. Start with the PRD to capture 
all requirements, then fill out each template completely. 
Ask me questions if you need clarification on any aspect."
```

Or more specific:

```
"Using the agentic-first templates, plan a [DOMAIN] 
application that [CORE_VALUE_PROP]. Start by creating a 
comprehensive PRD, then work through all templates. Focus 
on [KEY_FEATURE] for the MVP. Target [USER_PERSONA] with 
a [BUSINESS_MODEL] model."
```

## Success Metrics for Agentic Development

Track these to ensure templates are working:

1. **Requirements Clarity**: Is the PRD complete and unambiguous?
2. **Development Workflow**: Is claude.md properly customized?
3. **Time to First Value**: How quickly can you demo core value?
4. **Template Completion**: Are all sections filled meaningfully?
5. **Code-Template Alignment**: Does code match the plan?
6. **User Story Validation**: Do built features satisfy stories?
7. **Scaling Preparedness**: Can you handle 10x growth?

## Continuous Improvement

After each project:
1. Note which template sections were most valuable
2. Add new patterns you discovered
3. Update anti-patterns based on mistakes
4. Refine the templates for your domain
5. Share improvements with the community

## Remember

These templates are starting points. The best agentic-first software comes from:
- Deep understanding of user needs
- Iterative development with fast feedback
- Clear constraints and focused scope
- Building for scale from appropriate points
- Measuring everything that matters

The templates ensure you think through all aspects before building. The AI agent's job is to turn these plans into working software that delivers real value.

---

*Template Version: 1.1*
*Now includes: 10 comprehensive templates including claude.md*
*Optimized for: Claude Code, Cursor, and similar AI coding assistants*
*Domain: General software development with AI-first approach*