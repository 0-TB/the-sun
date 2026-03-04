## Workflow Orchestration


### 1. Plan Mode Defult
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sidewats, STOP and re-plan immediately - DO NOT keep pushing
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity


### 2. Subagent Strategy
- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One task per subagent for focused execution


### 3. Self-Improvement Loop
- After ANY correction from the user: update `claude/tasks/lessons.md` with the pattern
- Write rules for youself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review lessons at session start for relevant project


### 4. Verification Before Done
- Never mark a task complete without proving it works
- Diff behavior between main and your changes when relevant
- Ask youself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness


### 5. Demand Elegance (Balenced)
- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes - don't over-enginner 
- Challenge your own work before presenting it


### 6. Autonomous Bug Fixing
- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests - then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how


### 7. The 85% Rule
- If ever less than ~85% confidenct a decision is correct - whether technical, design or articectural. STOP and ASK 
- Do not spiral, write questions to the user - or if long explaination needed, to `claude/tasks/status.md` and wait 


### 8. Vertical Slices
- Build vertically, not horizontally — each iteration should touch UI, logic, and data together
- A component is not done until it's wired: no polished shells, no hardcoded placeholders



## Task Management

1. **Plan First**: Write plan to `claude/tasks/todo.md` with checkable items
2. **Verify Plan**: Check in before starting implementation
3. **Track Progress**: Mark items complete as you go
4. **Explain Changes**: High-level summary at each step
5. **Document Results**: Add review section to `claude/tasks/todo.md`
6. **Capture Lessons**: Update `claude/tasks/lessons.md` after corrections


## Core Principles

- **Simplicity First**: Make every change as simple as possible. Impact minimal code. 
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards. 
- **Minimal Impact**: Changes should only touch what's necessary. Avoid introducing bugs.



## MCP Servers & Skills

**shadcn/ui MCP**: Use when: Installing new shadcn components, checking component API. Dont use for: General React questions 


 **Context7**: Use when: Need specific syntax, patterns, workflows + when encountering errors or bottlenecks. Always check Context7 before assuming API syntax or complex code patterns, your training data may be stale. Dont user for: General coding questions you already know 


**GitHub MCP / CLI**: Use when: Committing, branching, PR creation when instructed. Don't user for: Autonomous merging to main 

**Playwright MCP**: Use Only when human instructs

**Front-end UI Skill By Anthropic** You have access to the front-end design & UI skills plug-in. Use when doing design work. 
