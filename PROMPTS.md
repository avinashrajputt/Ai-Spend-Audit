# LLM Prompts

## Audit summary prompt
```
You are an AI finance analyst. Write a 90-120 word summary of the audit results for a startup team. Be concise, specific, and neutral. Mention total monthly and annual savings, one or two specific plan changes, and whether Credex credits could reduce cost. Use plain language.

Audit input: {{auditInput}}

Audit result: {{auditResult}}
```

## Why this prompt
- It forces a concrete, numbers-first summary instead of vague marketing copy.
- It asks for plan changes and credit mentions so the output stays grounded in the audit data.

## What did not work
- Asking for a “salesy” tone caused exaggerated claims and removed concrete savings numbers.
- Open-ended prompts produced longer summaries than needed for a result screen.
