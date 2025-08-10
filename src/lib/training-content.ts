/**
 * Training Content Management System
 * 
 * This module manages prompt engineering training content to enhance
 * AI-generated prompts and provide context-aware guidance to users.
 */

export interface TrainingExample {
  id: string
  category: string
  subcategory?: string
  title: string
  description: string
  goodExample: string
  badExample?: string
  explanation: string
  tags: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  useCase: string[]
}

export interface PromptPattern {
  id: string
  name: string
  description: string
  template: string
  variables: string[]
  category: string
  examples: string[]
  whenToUse: string
  tags: string[]
}

export interface TrainingContent {
  principles: TrainingExample[]
  patterns: PromptPattern[]
  bestPractices: {
    category: string
    practices: {
      title: string
      description: string
      example: string
    }[]
  }[]
}

// Core prompt engineering training content
export const TRAINING_CONTENT: TrainingContent = {
  principles: [
    {
      id: 'systematic-framework-1',
      category: 'structure',
      subcategory: 'systematic-approach',
      title: 'Use the Systematic 4-Part Framework',
      description: 'Follow the proven Goal → Format → Verification → Context structure for comprehensive prompts',
      goodExample: `Goal: I want a list of innovative productivity apps launched in 2024 that have fewer than 10,000 users but high ratings.

For each app, return:
1. App name and platform
2. Core unique feature
3. Current user rating (with source)
4. Launch date
5. Why it's innovative

Be careful to ensure that the apps actually exist, were launched in 2024, and verify user counts are accurate from app store data.

For context: I'm a productivity blogger looking for hidden gems to feature. I avoid mainstream apps and prefer tools that solve specific workflow problems.`,
      badExample: 'Tell me about some good productivity apps.',
      explanation: 'The systematic framework ensures completeness: clear goal, specific output format, verification requirements, and personal context for tailoring.',
      tags: ['systematic', 'framework', 'structure', 'comprehensive'],
      difficulty: 'advanced',
      useCase: ['research', 'analysis', 'content-creation', 'data-collection']
    },
    {
      id: 'specificity-1',
      category: 'clarity',
      subcategory: 'specificity',
      title: 'Be Specific About Output Format',
      description: 'Always specify exactly how you want the response formatted',
      goodExample: 'Write a product description for a wireless headphone. Format: 3 paragraphs, each 2-3 sentences. Include: features, benefits, and call-to-action.',
      badExample: 'Write a product description for wireless headphones.',
      explanation: 'The good example provides clear structure, length requirements, and content expectations, leading to more consistent and useful outputs.',
      tags: ['formatting', 'structure', 'clarity'],
      difficulty: 'beginner',
      useCase: ['content-creation', 'marketing', 'documentation']
    },
    {
      id: 'context-1',
      category: 'context',
      subcategory: 'background',
      title: 'Provide Rich Context',
      description: 'Give the AI enough background to understand the situation fully',
      goodExample: 'You are a senior marketing manager at a B2B SaaS company. Write an email to potential customers who downloaded our whitepaper but haven\'t engaged further. Our software helps automate invoice processing. Tone: professional but approachable.',
      badExample: 'Write a follow-up email to potential customers.',
      explanation: 'Rich context helps the AI understand the role, audience, product, and appropriate tone, resulting in more targeted and effective content.',
      tags: ['context', 'role-playing', 'audience'],
      difficulty: 'intermediate',
      useCase: ['marketing', 'sales', 'customer-communication']
    },
    {
      id: 'examples-1',
      category: 'examples',
      subcategory: 'demonstration',
      title: 'Use Concrete Examples',
      description: 'Show the AI exactly what you want with specific examples',
      goodExample: 'Create social media captions for our coffee shop. Style should match these examples:\n• "Rainy Monday calls for our signature dark roast ☕ What\'s your go-to comfort drink?" \n• "Fresh pastries just out of the oven! 🥐 First come, first served at our downtown location"',
      badExample: 'Create engaging social media captions for our coffee shop.',
      explanation: 'Concrete examples establish tone, style, format, and content expectations much more effectively than abstract descriptions.',
      tags: ['examples', 'style', 'demonstration'],
      difficulty: 'beginner',
      useCase: ['social-media', 'content-creation', 'branding']
    },
    {
      id: 'constraints-1',
      category: 'structure',
      subcategory: 'constraints',
      title: 'Use Helpful Constraints',
      description: 'Set boundaries to focus the AI\'s creativity and ensure relevance',
      goodExample: 'Write a blog post about sustainable gardening. Requirements: 800-1000 words, 5 main sections, include at least 3 actionable tips per section, avoid mentioning specific brands, focus on beginner-friendly advice.',
      badExample: 'Write a blog post about gardening.',
      explanation: 'Constraints help the AI deliver focused, actionable content that meets your specific needs rather than generic information.',
      tags: ['constraints', 'focus', 'requirements'],
      difficulty: 'intermediate',
      useCase: ['content-creation', 'blogging', 'education']
    },
    {
      id: 'iteration-1',
      category: 'iteration',
      subcategory: 'refinement',
      title: 'Build Iteratively',
      description: 'Start with a basic prompt and refine based on results',
      goodExample: 'Step 1: "Explain machine learning in simple terms"\nStep 2: "Explain machine learning to a 12-year-old using everyday analogies"\nStep 3: "Explain machine learning to a 12-year-old using cooking analogies, with 3 specific examples"',
      badExample: 'Trying to get the perfect explanation in one complex prompt.',
      explanation: 'Iterative refinement helps you understand how the AI responds and allows you to fine-tune your approach for better results.',
      tags: ['iteration', 'refinement', 'testing'],
      difficulty: 'advanced',
      useCase: ['education', 'explanation', 'content-development']
    },
    {
      id: 'hyper-specific-manager',
      category: 'advanced',
      subcategory: 'enterprise-grade',
      title: 'Be Hyper-Specific & Detailed (The "Manager" Approach)',
      description: 'Treat your LLM like a new employee with comprehensive, detailed instructions',
      goodExample: `You are a senior customer service manager responsible for reviewing and approving tool calls made by junior agents. Your role requires careful analysis and decision-making to ensure customer satisfaction while maintaining company policies.

Your primary task is to evaluate each tool call request and determine whether to APPROVE or REJECT it based on the following criteria:

APPROVAL CRITERIA:
- Customer request is within policy guidelines
- Tool call is technically appropriate for the situation
- Risk level is acceptable (Low or Medium only)
- All required information is present and accurate

REJECTION CRITERIA:
- Request violates company policy
- Missing critical customer information
- High risk or potential for damage
- Tool call inappropriate for the issue type

OUTPUT FORMAT:
For each evaluation, provide:
<decision>APPROVE/REJECT</decision>
<reasoning>Brief explanation of your decision</reasoning>
<risk_level>LOW/MEDIUM/HIGH</risk_level>
<next_steps>What should happen next</next_steps>

CONSTRAINTS:
- Always prioritize customer safety and satisfaction
- When in doubt, escalate rather than approve high-risk actions
- Document reasoning clearly for audit purposes
- Maintain professional tone in all communications`,
      badExample: 'Review this customer service request and approve or reject it.',
      explanation: 'The hyper-specific approach provides comprehensive role definition, clear criteria, structured output format, and detailed constraints - leading to consistent, reliable performance.',
      tags: ['enterprise', 'detailed', 'structured', 'role-based'],
      difficulty: 'advanced',
      useCase: ['customer-service', 'approval-workflows', 'quality-control', 'business-processes']
    },
    {
      id: 'meta-prompting',
      category: 'advanced',
      subcategory: 'self-improvement',
      title: 'Meta-Prompting (LLM, Improve Thyself!)',
      description: 'Use an LLM to help write and refine your prompts for better results',
      goodExample: `You are an expert prompt engineer. Analyze and improve the following prompt:

CURRENT PROMPT:
"Write a summary of this article."

PROBLEMS OBSERVED:
- Outputs are too generic and lack focus
- Length is inconsistent 
- Important details are often missed
- No clear audience or purpose specified

REQUIREMENTS:
- Target audience: Marketing professionals
- Length: 2-3 paragraphs, ~150 words
- Focus: Key insights and actionable takeaways
- Style: Professional but engaging

Please rewrite this prompt to address these issues and include:
1. Clear role assignment for the AI
2. Specific output structure and length
3. Quality criteria and constraints
4. Examples of good vs bad outputs (if helpful)

Output the improved prompt ready for immediate use.`,
      badExample: 'Make this prompt better: "Write a summary of this article."',
      explanation: 'Meta-prompting leverages the AI\'s self-knowledge by providing context about current problems, specific requirements, and clear improvement goals.',
      tags: ['meta-prompting', 'self-improvement', 'prompt-optimization', 'iterative'],
      difficulty: 'advanced',
      useCase: ['prompt-development', 'optimization', 'quality-improvement', 'iterative-design']
    },
    {
      id: 'escape-hatch',
      category: 'reliability',
      subcategory: 'error-handling',
      title: 'Implement an "Escape Hatch"',
      description: 'Instruct the LLM to explicitly state limitations rather than hallucinating',
      goodExample: `Analyze the provided financial data and generate investment recommendations.

ESCAPE CONDITIONS - If any of the following apply, respond with "INSUFFICIENT_DATA" and specify what's missing:
- Less than 2 years of financial history provided
- Key metrics are missing (revenue, profit margins, debt ratios)
- Data appears inconsistent or contains obvious errors
- Market context or industry benchmarks are not available
- Risk tolerance or investment timeline not specified

UNCERTAINTY HANDLING:
- If confidence level is below 70%, state: "LOW_CONFIDENCE: [reason]"
- For predictions, always include confidence intervals
- When making assumptions, explicitly state them
- If multiple valid interpretations exist, present alternatives

If you cannot provide a reliable analysis due to insufficient or unclear data, respond:
"I don't have enough reliable information to make investment recommendations. I need: [specific requirements]"`,
      badExample: 'Analyze this financial data and give investment recommendations.',
      explanation: 'Escape hatches prevent hallucination by giving the AI permission to admit limitations, leading to more trustworthy outputs.',
      tags: ['reliability', 'error-handling', 'trustworthiness', 'quality-control'],
      difficulty: 'intermediate',
      useCase: ['financial-analysis', 'research', 'decision-support', 'risk-assessment']
    },
    {
      id: 'debug-thinking-traces',
      category: 'advanced',
      subcategory: 'debugging',
      title: 'Use Debug Info & Thinking Traces',
      description: 'Ask the LLM to include reasoning and decision-making process for debugging',
      goodExample: `Classify this customer email as URGENT, NORMAL, or LOW priority.

EMAIL: [customer email content]

Provide your response in this format:

CLASSIFICATION: [URGENT/NORMAL/LOW]

CONFIDENCE: [0-100%]

REASONING:
<thinking>
1. Key indicators I'm looking for:
   - Language urgency (words like "emergency", "immediately", "broken")
   - Business impact (revenue loss, system down, customer-facing issues)
   - Timeline sensitivity (deadlines, events, time-critical requests)

2. Analysis of this email:
   [Your step-by-step analysis here]

3. Decision factors:
   [What led to your classification]

4. Confidence assessment:
   [Why you assigned this confidence level]
</thinking>

RECOMMENDED_ACTION: [What should happen next]`,
      badExample: 'Classify this customer email as urgent, normal, or low priority.',
      explanation: 'Debug traces provide insight into the AI\'s reasoning process, making it easier to identify issues and improve prompt performance.',
      tags: ['debugging', 'transparency', 'reasoning', 'classification'],
      difficulty: 'advanced',
      useCase: ['customer-service', 'classification', 'debugging', 'quality-assurance']
    }
  ],
  patterns: [
    {
      id: 'systematic-framework',
      name: 'Systematic 4-Part Framework',
      description: 'Comprehensive structure: Goal → Format → Verification → Context',
      template: `Goal: I want {GOAL_STATEMENT} within {SCOPE} that meets {CRITERIA}.

For each {ITEM}, return:
1. {FIELD_1}
2. {FIELD_2}
3. {FIELD_3}

Be careful to ensure that {VERIFICATION_REQUIREMENTS}, that it actually exists/is correct, and that {SECONDARY_REQUIREMENTS}.

For context: {PERSONAL_BACKGROUND_AND_PREFERENCES}.`,
      variables: ['GOAL_STATEMENT', 'SCOPE', 'CRITERIA', 'ITEM', 'FIELD_1', 'FIELD_2', 'FIELD_3', 'VERIFICATION_REQUIREMENTS', 'SECONDARY_REQUIREMENTS', 'PERSONAL_BACKGROUND_AND_PREFERENCES'],
      category: 'comprehensive-structure',
      examples: [
        `Goal: I want a list of family-friendly restaurants in downtown Seattle that offer outdoor seating and vegetarian options.

For each restaurant, return:
1. Name and exact address
2. Type of cuisine and price range
3. Outdoor seating description (covered/uncovered, capacity)
4. Best vegetarian dishes (with prices)
5. Customer rating and recent review highlight

Be careful to ensure that the restaurants are currently open, actually have outdoor seating, and verify vegetarian options are substantial (not just salads).

For context: I'm planning a family dinner for next weekend with my vegetarian sister and want somewhere my kids can be a bit noisy without disturbing other diners.`,
        `Goal: I want a comparison of project management tools suitable for remote teams of 5-15 people that integrate with Slack and have strong reporting features.

For each tool, return:
1. Tool name and pricing structure
2. Key Slack integration features
3. Types of reports available
4. Team collaboration strengths
5. Setup complexity and learning curve

Be careful to ensure that pricing information is current, Slack integrations are native (not third-party), and verify reporting capabilities are built-in.

For context: I manage a distributed design team that struggles with visibility into project progress. We're heavy Slack users and need something that doesn't require extensive training.`
      ],
      whenToUse: 'For complex research requests, data collection, or when you need comprehensive, verifiable results with specific formatting',
      tags: ['systematic', 'comprehensive', 'research', 'verification']
    },
    {
      id: 'role-task-format',
      name: 'Role-Task-Format Pattern',
      description: 'Establish role, define task, specify format',
      template: 'You are a {ROLE}. Your task is to {TASK}. Please format your response as {FORMAT}.',
      variables: ['ROLE', 'TASK', 'FORMAT'],
      category: 'structure',
      examples: [
        'You are a technical writer. Your task is to explain how APIs work to non-technical stakeholders. Please format your response as a 5-minute presentation outline with key points and analogies.',
        'You are a career counselor. Your task is to help someone transition from teaching to UX design. Please format your response as a step-by-step action plan with timelines.'
      ],
      whenToUse: 'When you need the AI to adopt a specific perspective and deliver structured output',
      tags: ['role-playing', 'structure', 'format']
    },
    {
      id: 'context-constraint-output',
      name: 'Context-Constraint-Output Pattern',
      description: 'Provide context, set constraints, define expected output',
      template: 'Context: {SITUATION}. Constraints: {LIMITATIONS}. Create: {OUTPUT_TYPE}.',
      variables: ['SITUATION', 'LIMITATIONS', 'OUTPUT_TYPE'],
      category: 'content-creation',
      examples: [
        'Context: Our startup just received Series A funding and is scaling rapidly. Constraints: Budget-conscious, remote team, need quick implementation. Create: An employee onboarding checklist for new remote developers.',
        'Context: Small restaurant wants to increase takeout orders during slow periods. Constraints: Limited marketing budget, family-owned business, local community focus. Create: A social media marketing strategy.'
      ],
      whenToUse: 'For practical problem-solving where real-world constraints matter',
      tags: ['context', 'constraints', 'problem-solving']
    },
    {
      id: 'example-driven',
      name: 'Example-Driven Pattern',
      description: 'Provide examples to establish style and quality',
      template: 'Create {OUTPUT_TYPE} similar to these examples: {EXAMPLES}. Match the style, tone, and structure.',
      variables: ['OUTPUT_TYPE', 'EXAMPLES'],
      category: 'style-matching',
      examples: [
        'Create product descriptions similar to these examples: [Example 1: Clean, benefit-focused copy], [Example 2: Technical but accessible language]. Match the style, tone, and structure.',
        'Write email subject lines similar to these examples: [Example 1: Curiosity-driven], [Example 2: Benefit-focused]. Match the style, tone, and structure.'
      ],
      whenToUse: 'When you want to maintain consistency with existing content or establish a specific style',
      tags: ['examples', 'style', 'consistency']
    },
    {
      id: 'enterprise-persona-pattern',
      name: 'Enterprise Persona Pattern',
      description: 'Comprehensive role assignment with detailed responsibilities and constraints',
      template: `You are a {ROLE} with {EXPERIENCE_LEVEL} experience in {DOMAIN}. 

ROLE RESPONSIBILITIES:
- {PRIMARY_RESPONSIBILITY}
- {SECONDARY_RESPONSIBILITY}  
- {TERTIARY_RESPONSIBILITY}

EXPERTISE AREAS:
- {EXPERTISE_1}: {DESCRIPTION}
- {EXPERTISE_2}: {DESCRIPTION}
- {EXPERTISE_3}: {DESCRIPTION}

OPERATING CONSTRAINTS:
- {CONSTRAINT_1}
- {CONSTRAINT_2}
- {CONSTRAINT_3}

COMMUNICATION STYLE:
- Tone: {TONE}
- Formality: {FORMALITY_LEVEL}
- Technical depth: {TECHNICAL_LEVEL}

Your task: {SPECIFIC_TASK}

Expected output format:
{OUTPUT_STRUCTURE}`,
      variables: ['ROLE', 'EXPERIENCE_LEVEL', 'DOMAIN', 'PRIMARY_RESPONSIBILITY', 'SECONDARY_RESPONSIBILITY', 'TERTIARY_RESPONSIBILITY', 'EXPERTISE_1', 'EXPERTISE_2', 'EXPERTISE_3', 'CONSTRAINT_1', 'CONSTRAINT_2', 'CONSTRAINT_3', 'TONE', 'FORMALITY_LEVEL', 'TECHNICAL_LEVEL', 'SPECIFIC_TASK', 'OUTPUT_STRUCTURE'],
      category: 'enterprise-grade',
      examples: [
        `You are a Senior Data Scientist with 8+ years of experience in machine learning and predictive analytics.

ROLE RESPONSIBILITIES:
- Design and implement ML models for business problem-solving
- Evaluate model performance and provide actionable insights
- Communicate complex findings to non-technical stakeholders

EXPERTISE AREAS:
- Statistical Analysis: Advanced statistical methods and hypothesis testing
- Machine Learning: Supervised/unsupervised learning, deep learning, ensemble methods
- Data Visualization: Creating compelling visual narratives from data

OPERATING CONSTRAINTS:
- All recommendations must be backed by statistical significance
- Consider computational cost and scalability in model selection
- Ensure compliance with data privacy regulations

COMMUNICATION STYLE:
- Tone: Professional yet accessible
- Formality: Business formal with technical precision
- Technical depth: High for methodology, simplified for business impact

Your task: Analyze customer churn data and recommend retention strategies.

Expected output format:
1. Executive Summary (2-3 sentences)
2. Key Findings (bullet points)
3. Model Performance Metrics
4. Recommended Actions (prioritized list)
5. Implementation Timeline`
      ],
      whenToUse: 'For complex, high-stakes tasks requiring domain expertise and professional-grade outputs',
      tags: ['enterprise', 'persona', 'professional', 'detailed']
    },
    {
      id: 'structured-xml-output',
      name: 'Structured XML Output Pattern',
      description: 'Use XML-like tags for machine-readable, parseable output structure',
      template: `{TASK_DESCRIPTION}

Output your response using the following XML structure:

<response>
  <{TAG_1}>{CONTENT_1}</{TAG_1}>
  <{TAG_2}>{CONTENT_2}</{TAG_2}>
  <{TAG_3}>{CONTENT_3}</{TAG_3}>
  <metadata>
    <confidence_level>{CONFIDENCE}</confidence_level>
    <processing_time>{TIME}</processing_time>
    <sources_used>{SOURCES}</sources_used>
  </metadata>
</response>

Ensure all XML tags are properly closed and content is escaped if necessary.`,
      variables: ['TASK_DESCRIPTION', 'TAG_1', 'CONTENT_1', 'TAG_2', 'CONTENT_2', 'TAG_3', 'CONTENT_3', 'CONFIDENCE', 'TIME', 'SOURCES'],
      category: 'structured-output',
      examples: [
        `Analyze the sentiment of customer feedback and categorize the main concerns.

Output your response using the following XML structure:

<sentiment_analysis>
  <overall_sentiment>POSITIVE/NEGATIVE/NEUTRAL</overall_sentiment>
  <sentiment_score>0.0-1.0</sentiment_score>
  <primary_concerns>
    <concern category="CATEGORY">Description</concern>
    <concern category="CATEGORY">Description</concern>
  </primary_concerns>
  <recommendations>
    <action priority="HIGH/MEDIUM/LOW">Specific action item</action>
    <action priority="HIGH/MEDIUM/LOW">Specific action item</action>
  </recommendations>
  <metadata>
    <confidence_level>85%</confidence_level>
    <total_reviews_analyzed>247</total_reviews_analyzed>
    <processing_method>NLP sentiment analysis with keyword extraction</processing_method>
  </metadata>
</sentiment_analysis>`
      ],
      whenToUse: 'When you need machine-parseable output, consistent data structure, or integration with automated systems',
      tags: ['structured', 'xml', 'parseable', 'integration']
    },
    {
      id: 'prompt-folding-dynamic',
      name: 'Prompt Folding & Dynamic Generation',
      description: 'Create prompts that generate specialized sub-prompts based on context',
      template: `STAGE 1 - CLASSIFIER:
Analyze the following input and determine the most appropriate specialized approach:

INPUT: {USER_INPUT}

Classification options:
- {OPTION_1}: {DESCRIPTION_1}
- {OPTION_2}: {DESCRIPTION_2}  
- {OPTION_3}: {DESCRIPTION_3}

Output format:
CLASSIFICATION: {CHOSEN_OPTION}
CONFIDENCE: {CONFIDENCE_LEVEL}
KEY_FACTORS: {FACTORS_THAT_LED_TO_CLASSIFICATION}

STAGE 2 - DYNAMIC PROMPT GENERATION:
Based on your classification, generate a specialized prompt for the next stage:

If {OPTION_1}, generate: {SPECIALIZED_PROMPT_1}
If {OPTION_2}, generate: {SPECIALIZED_PROMPT_2}
If {OPTION_3}, generate: {SPECIALIZED_PROMPT_3}

The generated prompt should be complete and ready for immediate execution.`,
      variables: ['USER_INPUT', 'OPTION_1', 'DESCRIPTION_1', 'OPTION_2', 'DESCRIPTION_2', 'OPTION_3', 'DESCRIPTION_3', 'CHOSEN_OPTION', 'CONFIDENCE_LEVEL', 'FACTORS_THAT_LED_TO_CLASSIFICATION', 'SPECIALIZED_PROMPT_1', 'SPECIALIZED_PROMPT_2', 'SPECIALIZED_PROMPT_3'],
      category: 'adaptive-systems',
      examples: [
        `STAGE 1 - CLASSIFIER:
Analyze the following customer support request and determine the most appropriate specialized approach:

INPUT: [Customer message]

Classification options:
- TECHNICAL_ISSUE: Hardware/software problems requiring troubleshooting steps
- BILLING_INQUIRY: Payment, refund, or account-related questions
- FEATURE_REQUEST: Suggestions for new features or improvements

Output format:
CLASSIFICATION: [CHOSEN_OPTION]
CONFIDENCE: [0-100%]
KEY_FACTORS: [What in the message led to this classification]

STAGE 2 - DYNAMIC PROMPT GENERATION:
Based on your classification, generate a specialized prompt for the next stage:

If TECHNICAL_ISSUE, generate:
"You are a technical support specialist. Guide the customer through systematic troubleshooting steps for their specific issue. Include: 1) Problem verification, 2) Step-by-step solutions, 3) Alternative approaches, 4) Escalation criteria."

If BILLING_INQUIRY, generate:
"You are a billing specialist with access to account information. Address the customer's financial concern with: 1) Account verification, 2) Clear explanation of charges, 3) Available options/solutions, 4) Next steps and timeline."

If FEATURE_REQUEST, generate:
"You are a product manager collecting feature requests. Document the customer's suggestion with: 1) Use case understanding, 2) Priority assessment, 3) Technical feasibility, 4) Timeline expectations, 5) Follow-up process."`
      ],
      whenToUse: 'For complex workflows where different inputs require fundamentally different approaches',
      tags: ['adaptive', 'classification', 'workflow', 'dynamic']
    },
    {
      id: 'meta-prompting-refinement',
      name: 'Meta-Prompting Refinement Pattern',
      description: 'Use AI to iteratively improve prompts based on performance feedback',
      template: `You are an expert prompt engineer. Your task is to analyze and improve the following prompt based on observed performance issues.

CURRENT PROMPT:
{EXISTING_PROMPT}

PERFORMANCE ISSUES OBSERVED:
{ISSUE_1}: {DESCRIPTION_1}
{ISSUE_2}: {DESCRIPTION_2}
{ISSUE_3}: {DESCRIPTION_3}

SAMPLE OUTPUTS (showing problems):
Good example: {GOOD_OUTPUT_EXAMPLE}
Bad example 1: {BAD_OUTPUT_1}
Bad example 2: {BAD_OUTPUT_2}

IMPROVEMENT REQUIREMENTS:
- {REQUIREMENT_1}
- {REQUIREMENT_2}
- {REQUIREMENT_3}

CONSTRAINTS:
- Maintain core functionality
- Keep prompt length under {MAX_LENGTH} words
- Ensure compatibility with {MODEL_TYPE}

OUTPUT:
Provide the improved prompt followed by a brief explanation of key changes made.`,
      variables: ['EXISTING_PROMPT', 'ISSUE_1', 'DESCRIPTION_1', 'ISSUE_2', 'DESCRIPTION_2', 'ISSUE_3', 'DESCRIPTION_3', 'GOOD_OUTPUT_EXAMPLE', 'BAD_OUTPUT_1', 'BAD_OUTPUT_2', 'REQUIREMENT_1', 'REQUIREMENT_2', 'REQUIREMENT_3', 'MAX_LENGTH', 'MODEL_TYPE'],
      category: 'optimization',
      examples: [
        `You are an expert prompt engineer. Your task is to analyze and improve the following prompt based on observed performance issues.

CURRENT PROMPT:
"Summarize this research paper."

PERFORMANCE ISSUES OBSERVED:
Inconsistent length: Outputs vary from 2 sentences to 3 paragraphs
Missing key insights: Often omits methodology or limitations
No target audience: Style varies wildly between technical and general

SAMPLE OUTPUTS (showing problems):
Good example: "This study examined machine learning bias in hiring algorithms using a dataset of 10,000 applications. Key finding: Gender bias persisted even with balanced training data, suggesting systemic issues in feature selection."

Bad example 1: "The paper talks about AI bias."
Bad example 2: "This comprehensive analysis utilizing advanced statistical methodologies and robust experimental frameworks demonstrates significant correlations between algorithmic decision-making processes and systematic demographic disparities..."

IMPROVEMENT REQUIREMENTS:
- Consistent length: exactly 2-3 sentences, ~75-100 words
- Always include: main finding, methodology, and significance
- Target audience: Business executives (non-technical)

CONSTRAINTS:
- Maintain core functionality
- Keep prompt length under 150 words
- Ensure compatibility with Claude/GPT models

OUTPUT:
Provide the improved prompt followed by a brief explanation of key changes made.`
      ],
      whenToUse: 'When you have a working prompt that needs optimization based on real-world performance data',
      tags: ['meta-prompting', 'optimization', 'iterative', 'performance']
    }
  ],
  bestPractices: [
    {
      category: 'State-of-the-Art Enterprise Techniques',
      practices: [
        {
          title: 'Hyper-specific role assignment',
          description: 'Define comprehensive personas with detailed responsibilities, expertise areas, and operating constraints',
          example: 'Instead of "You are a consultant," use "You are a Senior Management Consultant with 10+ years in digital transformation, specializing in Fortune 500 retail companies, with expertise in change management, process optimization, and stakeholder alignment."'
        },
        {
          title: 'Structured XML output for integration',
          description: 'Use XML-like tags for machine-parseable responses when building AI agent systems',
          example: 'Use <decision>APPROVE</decision><confidence>85%</confidence><reasoning>Customer request meets policy guidelines</reasoning> instead of unstructured text.'
        },
        {
          title: 'Implement escape hatches',
          description: 'Always provide explicit instructions for handling uncertainty or insufficient information',
          example: 'Add "If you cannot determine X with high confidence, respond with \'INSUFFICIENT_DATA: [specific requirements needed]\'" to prevent hallucination.'
        },
        {
          title: 'Include debug traces',
          description: 'Ask for reasoning explanations to improve debugging and system refinement',
          example: 'Add <thinking>Step 1: I\'m analyzing... Step 2: Key factors are... Step 3: My conclusion is...</thinking> sections for transparency.'
        },
        {
          title: 'Use meta-prompting for optimization',
          description: 'Leverage AI to improve prompts by providing current performance issues and desired improvements',
          example: 'Give the AI your existing prompt, examples of bad outputs, and specific improvement requirements to get better versions.'
        },
        {
          title: 'Design for prompt folding',
          description: 'Create adaptive systems where initial prompts can generate specialized follow-up prompts based on context',
          example: 'Use classification stages that determine the type of request, then dynamically generate appropriate specialized prompts for each type.'
        }
      ]
    },
    {
      category: 'Systematic Framework Application',
      practices: [
        {
          title: 'Use specificity over generality',
          description: 'Name sources, formats, and filters where possible rather than being vague',
          example: 'Instead of "find good restaurants," specify "find Italian restaurants in downtown Portland with 4+ stars on Google Reviews and outdoor seating."'
        },
        {
          title: 'Include verifiability clauses',
          description: 'Add explicit accuracy checks to reduce AI hallucination and errors',
          example: 'Add "Be careful to ensure that the restaurants are currently open and verify the addresses are correct" to prevent outdated information.'
        },
        {
          title: 'Put context last',
          description: 'Place personal context after hard constraints so the model processes requirements first',
          example: 'Goal → Format → Verification → Context order ensures constraints are prioritized over subjective preferences.'
        },
        {
          title: 'Signal output structure early',
          description: 'Define the exact format and fields at the beginning so formatting is predictable',
          example: 'Start with "For each item, return: 1. Name 2. Description 3. Rating" rather than hoping for consistent formatting.'
        }
      ]
    },
    {
      category: 'Prompt Construction',
      practices: [
        {
          title: 'Start with the end in mind',
          description: 'Define your desired outcome before crafting the prompt',
          example: 'Instead of "write about dogs," think "I need a 500-word article about dog training basics for new pet owners that I can publish on my blog."'
        },
        {
          title: 'Use progressive disclosure',
          description: 'Reveal information in the order the AI needs it',
          example: 'First establish context and role, then provide the task, finally specify format and constraints.'
        },
        {
          title: 'Test with edge cases',
          description: 'Try your prompt with unusual or challenging inputs',
          example: 'If creating a customer service response template, test with both simple complaints and complex multi-issue scenarios.'
        }
      ]
    },
    {
      category: 'Content Quality',
      practices: [
        {
          title: 'Request reasoning',
          description: 'Ask the AI to explain its approach or decision-making',
          example: 'Add "Explain your reasoning for each recommendation" to get insight into the AI\'s logic.'
        },
        {
          title: 'Set quality standards',
          description: 'Define what good output looks like',
          example: '"Ensure each paragraph has a clear topic sentence and supporting details, with smooth transitions between ideas."'
        },
        {
          title: 'Use comparison techniques',
          description: 'Ask for multiple approaches or alternatives',
          example: '"Provide three different approaches to this problem, each optimized for a different priority (speed, cost, quality)."'
        }
      ]
    }
  ]
}

/**
 * Get training content relevant to a specific prompt generation request
 */
export function getRelevantTrainingContent(
  purpose: string,
  domain: string,
  tone?: string
): {
  principles: TrainingExample[]
  patterns: PromptPattern[]
  tips: string[]
} {
  const purposeLower = purpose.toLowerCase()
  const domainLower = domain.toLowerCase()
  const toneLower = tone?.toLowerCase() || ''

  // Find relevant principles based on use case and category
  const relevantPrinciples = TRAINING_CONTENT.principles.filter(principle => {
    const matchesUseCase = principle.useCase.some(useCase => 
      purposeLower.includes(useCase) || domainLower.includes(useCase)
    )
    const matchesTags = principle.tags.some(tag => 
      purposeLower.includes(tag) || domainLower.includes(tag) || toneLower.includes(tag)
    )
    return matchesUseCase || matchesTags
  })

  // Find relevant patterns
  const relevantPatterns = TRAINING_CONTENT.patterns.filter(pattern => {
    const matchesTags = pattern.tags.some(tag => 
      purposeLower.includes(tag) || domainLower.includes(tag)
    )
    const matchesCategory = purposeLower.includes(pattern.category) || domainLower.includes(pattern.category)
    return matchesTags || matchesCategory
  })

  // Generate contextual tips
  const tips = [
    `For ${domain} content, focus on domain-specific terminology and audience expectations.`,
    `Consider your audience's expertise level when crafting prompts for ${purpose}.`,
    tone ? `Maintain a ${tone} tone throughout your prompt to get consistent results.` : 'Define the desired tone explicitly in your prompt.',
    'Use specific examples from your domain to guide the AI\'s understanding.',
    'Test your prompt with different inputs to ensure consistent quality.'
  ].filter(Boolean)

  return {
    principles: relevantPrinciples.slice(0, 3), // Limit to most relevant
    patterns: relevantPatterns.slice(0, 2),
    tips: tips.slice(0, 3)
  }
}

/**
 * Generate enhanced system prompt with training content
 */
export function createTrainingEnhancedSystemPrompt(
  basePrompt: string,
  relevantContent: ReturnType<typeof getRelevantTrainingContent>
): string {
  const { principles, patterns, tips } = relevantContent

  let enhancedPrompt = basePrompt

  if (principles.length > 0) {
    enhancedPrompt += '\n\n## Key Principles to Follow:\n'
    principles.forEach((principle, index) => {
      enhancedPrompt += `${index + 1}. **${principle.title}**: ${principle.explanation}\n`
      enhancedPrompt += `   Example: ${principle.goodExample}\n\n`
    })
  }

  if (patterns.length > 0) {
    enhancedPrompt += '\n\n## Recommended Patterns:\n'
    patterns.forEach((pattern, index) => {
      enhancedPrompt += `${index + 1}. **${pattern.name}**: ${pattern.description}\n`
      enhancedPrompt += `   Template: ${pattern.template}\n`
      enhancedPrompt += `   Use when: ${pattern.whenToUse}\n\n`
    })
  }

  if (tips.length > 0) {
    enhancedPrompt += '\n\n## Additional Guidelines:\n'
    tips.forEach((tip, index) => {
      enhancedPrompt += `• ${tip}\n`
    })
  }

  return enhancedPrompt
}