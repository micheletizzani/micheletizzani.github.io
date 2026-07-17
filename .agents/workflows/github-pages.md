---
description: Pre-Commit Readiness Workflow for github pages
---

# Pre-Commit Readiness Workflow

**Trigger:** When executing a code review, finalizing a feature, or preparing for a git commit.

**Objective:** Ensure code is logically sound, fully documented, and guaranteed to pass GitHub Actions deployment pipelines without formatting or build failures.

## 1. Code Review & Documentation

- Review the modified files for logic, structural integrity, and computational efficiency.
- Ensure all complex code blocks include concise inline documentation or docstrings.
- Keep explanations simple, clear, and precise.

## 2. Mandatory Formatting (Prettier)

- **Context:** The deployment CI pipeline enforces strict formatting via `prettier --check`. If unformatted files (like Markdown, YAML, JS, or Astro components) are pushed, the build fails with exit code 1.
- **Action:** Before concluding your review, you MUST execute (or explicitly instruct the user to execute) the following command to overwrite files with standard formatting:
  `npx prettier --write .`
- **Verification:** Confirm that Prettier has formatted all staged files, paying special attention to frontmatter in `.md` and `.yml` files.

## 3. Build & Type Verification

- **Context:** Code that passes Prettier can still fail deployment due to broken internal links, invalid YAML frontmatter, or compilation errors.
- **Action:** Require a local build check to catch these errors before they reach GitHub. Execute or instruct the user to run:
  - _If Astro:_ `npx astro check && npm run build`
  - _If Jekyll:_ `bundle exec jekyll build`

## 4. Final Handoff

- Present the final optimized code.
- Explicitly confirm in your output that formatting (`prettier --write`) and build checks have been completed successfully. Do not approve the commit readiness until these steps are verified.
