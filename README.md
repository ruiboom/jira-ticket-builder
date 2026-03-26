# Jira Ticket Builder

AI-powered tool that takes a Jira feature ticket and breaks it down into stories, tasks, and subtasks — then exports Jira-importable CSVs.

## How It Works

```
Paste feature ticket → AI analyzes & asks questions → Generates stories → Generates tasks → Export CSV
```

### 1. Paste Your Feature Ticket

Paste the full text of a Jira feature ticket. Optionally provide:

- **Context** — technical stack, architecture, constraints, business goals
- **Team** — names, roles, specialisms (e.g. "Alice — React, Bob — Go/payments")

These feed into every AI prompt so stories and tasks reflect your actual environment.

### 2. Answer Clarifying Questions

Claude analyzes the ticket and generates 5–15 questions about missing or ambiguous information, categorized as: scope, technical, UX, dependencies, acceptance criteria, or non-functional.

Answer as many or as few as you like, then proceed. Answered questions become additional context for story generation.

### 3. Edit Stories & Tasks

Claude generates 3–8 user stories. Each story can then generate 2–6 tasks (with optional subtasks) on demand.

Everything is editable inline:
- Summaries, descriptions, acceptance criteria
- Priority, labels, components, assignee, story points
- Add or delete stories, tasks, and subtasks manually

### 4. Export to CSV

Two export modes:
- **Single CSV** — entire hierarchy in one file
- **Per-story CSVs** — one file per story (with its tasks/subtasks)

CSV format matches Jira's import spec with `ID` / `Parent ID` columns for hierarchy:

```
ID,Parent ID,Issue Type,Summary,Description,Priority,Labels,Components,Assignee,Reporter,Fix Version,Epic Name,Epic Link,Story Points,Acceptance Criteria
1,,Epic,"Payment feature","...",High,payments,backend,,,,,,
2,1,Story,"As a user...","...",High,payments,backend,,,,,5,"- [ ] ..."
3,2,Task,"Create endpoint","...",Medium,payments,api,,,,,,
4,3,Sub-task,"Write tests","...",Medium,,,,,,,,
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com/)

### Install & Run

```bash
git clone <repo-url>
cd jira-ticket-builder
npm install
```

Create `.env.local` in the project root:

```
ANTHROPIC_API_KEY=sk-ant-...
```

Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build for Production

```bash
npm run build
npm start
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19 + Tailwind CSS 4 |
| State | Zustand 5 |
| AI | Anthropic SDK → Claude Sonnet 4 |
| Language | TypeScript 5 (strict mode) |
| IDs | uuid v13 |

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                        # Main app — 4-step flow
│   ├── layout.tsx                      # Root layout, fonts, metadata
│   ├── globals.css                     # Tailwind imports, CSS variables, dark mode
│   └── api/
│       ├── analyze/route.ts            # POST — analyze ticket, extract metadata, generate questions
│       ├── generate-stories/route.ts   # POST — feature + answers → stories
│       └── generate-tasks/route.ts     # POST — story → tasks + subtasks
├── components/
│   ├── TicketPasteForm.tsx             # Ticket text + context + team inputs
│   ├── QuestionsPanel.tsx              # AI questions with answer fields
│   ├── TicketTree.tsx                  # Card container + toolbar
│   ├── TicketCard.tsx                  # Expandable card for each ticket node
│   ├── InlineEditor.tsx                # Click-to-edit text (single/multiline)
│   ├── MetadataEditor.tsx              # Priority, labels, components, assignee editor
│   ├── ExportButton.tsx                # CSV download (single or per-story)
│   ├── StepIndicator.tsx               # Step 1–4 progress bar
│   ├── ThemeToggle.tsx                 # Light/dark mode toggle button
│   └── ApiKeyInput.tsx                 # API key input with localStorage
├── hooks/
│   ├── useTicketStore.ts               # Zustand store — all app state + actions
│   ├── useAiGeneration.ts              # Fetch wrapper for all 3 API routes
│   ├── useApiKey.ts                    # localStorage persistence for API key
│   └── useTheme.ts                     # Dark mode toggle with localStorage
└── lib/
    ├── types.ts                        # All TypeScript interfaces
    ├── prompts.ts                      # 3 Claude prompt templates
    ├── claude.ts                       # Anthropic SDK wrapper, callClaudeJson with auto-retry
    ├── csv-export.ts                   # Tree → CSV with ID/Parent ID hierarchy
    ├── parse-ai-response.ts            # Strip markdown fences, sanitize & parse JSON
    └── constants.ts                    # Priorities, colors, default metadata
```

---

## Architecture

### Data Model

Strict four-level hierarchy:

```
Feature (Epic)
 └── Story[]
      └── Task[]
           └── SubTask[]
```

Every node extends `BaseTicket`:

```typescript
interface BaseTicket {
  id: string;
  summary: string;
  description: string;
  issueType: "Epic" | "Story" | "Task" | "Sub-task";
  metadata: JiraMetadata;
  isExpanded: boolean;
}
```

`Feature` adds `originalText`, `questions[]`, `context`, and `team`.
`Story` adds `tasks[]`, `acceptanceCriteria`, and `storyPoints`.
`Task` adds `subtasks[]`.

### State Management

A single Zustand store (`useTicketStore`) holds the entire app state:

- **Navigation**: `step`, `setStep`
- **Feature tree**: `feature`, `setFeature`, `updateNode`, `removeNode`
- **Tree ops**: `addStory`, `addTask`, `addSubTask`, `toggleExpand`, `expandAll`, `collapseAll`
- **Questions**: `updateQuestion`

All mutations use immutable updates with recursive tree traversal.

### API Routes

All three routes follow the same pattern:

1. Parse request body
2. Build prompt from `src/lib/prompts.ts`
3. Call Claude via `callClaudeJson()` in `src/lib/claude.ts` (model: `claude-sonnet-4-20250514`, max tokens: 8192)
4. Parse and sanitize JSON from response (strips trailing commas, repairs truncated output)
5. On parse failure, automatically retry once with an explicit JSON-only reminder
6. Return data or error

| Route | Input | Output |
|---|---|---|
| `POST /api/analyze` | ticketText, context?, team? | metadata, summary, description, questions[] |
| `POST /api/generate-stories` | feature details, answered questions, context?, team? | stories[] with AC and story points |
| `POST /api/generate-tasks` | story details, feature context, context?, team? | tasks[] with optional subtasks[] |

### Dark Mode

The app supports light and dark themes via a toggle in the top-right corner. Theme preference is persisted to `localStorage` and applied before first paint (via an inline script in `layout.tsx`) to avoid a flash of unstyled content.

The implementation uses Tailwind CSS v4's `@custom-variant dark` with class-based toggling on the `<html>` element. All components use `dark:` variants for backgrounds, text, borders, and badges.

### CSV Export

`src/lib/csv-export.ts` performs a depth-first traversal of the ticket tree, assigning sequential IDs and parent IDs. Outputs 15 columns matching Jira's CSV import format. Handles CSV escaping for quotes, commas, and newlines.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | Yes | Your Anthropic API key for Claude |

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with Turbopack |
| `npm run build` | Production build |
| `npm start` | Serve production build |
| `npm run lint` | ESLint check |

---

## Importing CSVs into Jira

1. Export your tickets using the **Export All** or **Export Per-Story** option
2. In Jira, go to **System → Import & Export → External System Import → CSV**
3. Upload the CSV file
4. Map the columns — most will auto-match by header name
5. The `ID` and `Parent ID` columns establish the hierarchy (Epic → Story → Task → Sub-task)

**Note**: Jira's CSV import uses `ID` / `Parent ID` to create parent-child links. These are local identifiers in the file, not existing Jira issue keys.
