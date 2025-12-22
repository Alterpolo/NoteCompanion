# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Note Companion is an AI-powered Obsidian plugin for automatic note organization, formatting, and enhancement. It's a monorepo with pnpm workspaces and Turborepo.

## Common Commands

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run all packages in dev mode
pnpm dev

# Run specific packages
pnpm --filter plugin dev    # Plugin development
pnpm --filter web dev       # Web app (port 3010)
pnpm --filter mobile start  # Mobile app (Expo)

# Testing
pnpm --filter web test      # Jest tests for web
pnpm --filter web test:watch

# Linting
pnpm lint

# Database (web package)
pnpm --filter web db:generate  # Generate migrations
pnpm --filter web db:migrate   # Run migrations
pnpm --filter web db:studio    # Open Drizzle Studio

# Mobile builds
pnpm --filter mobile build:ios
pnpm --filter mobile build:android
```

## Architecture

### Package Structure

- **packages/plugin/** - Obsidian plugin (TypeScript, React 19, esbuild)
- **packages/web/** - Next.js 15 backend (Drizzle ORM, Clerk auth, Stripe)
- **packages/mobile/** - React Native/Expo SDK 52 app
- **packages/landing/** - Marketing website (Next.js)

### Core Workflow

1. Files placed in vault's inbox folder
2. Plugin analyzes and classifies via AI
3. Files moved to appropriate folders
4. Notes enhanced with formatting, tags, metadata

### AI Integration Pattern

Tools are **server-defined but client-executed**:
- Server (`packages/web/app/api/(new-ai)/tools.ts`): Define tool schemas (description + parameters, NO execute function)
- Client (`packages/plugin/views/assistant/ai-chat/tool-handlers/`): Execute tools with Obsidian API access

This pattern ensures vault data never leaves the user's machine during tool execution.

### Key Files

- `packages/web/app/api/(new-ai)/` - AI API endpoints
- `packages/web/drizzle/schema.ts` - Database schema
- `packages/plugin/index.ts` - Plugin main entry
- `packages/mobile/utils/file-handler.ts` - Mobile upload logic

## Plugin Styling (Critical)

Use **theme-agnostic, native Obsidian styling**:

```tsx
import { StyledContainer } from "../../components/ui/utils";
import { tw } from "../../lib/utils";

export function MyComponent() {
  return (
    <StyledContainer>
      <div className={tw("bg-[--background-primary] text-[--text-normal] p-2")}>
        {/* Use Obsidian CSS variables, not hardcoded colors */}
      </div>
    </StyledContainer>
  );
}
```

**Rules:**
- Always wrap components in `StyledContainer`
- Always use `tw()` for className merging
- Use Obsidian CSS variables (`--background-primary`, `--text-normal`, `--text-muted`)
- Never use hardcoded colors (`bg-white`, `#fff`, `bg-gray-800`)
- Never use heavy shadows (`shadow-lg`)
- Keep layouts dense (max 24px spacing)

**Key CSS Variables:**
- Backgrounds: `--background-primary`, `--background-secondary`, `--background-modifier-hover`
- Text: `--text-normal`, `--text-muted`, `--text-accent`
- Borders: `--background-modifier-border`, `--radius-s`
- Interactive: `--interactive-accent`, `--tag-background`

## File Upload Flow (Mobile)

Size-based strategy:
- **< 4MB**: Direct multipart upload to `/api/transcribe`
- **4-25MB**: Pre-signed URL upload to R2, then backend notification
- **> 25MB**: Error (OpenAI Whisper limit)

Flow: `create-upload-url` → R2 upload → `record-upload` → `process-file` → polling

## Adding New AI Tools

1. Define on server (`packages/web/app/api/(new-ai)/chat/tools.ts`):
```typescript
myNewTool: {
  description: "What this tool does",
  parameters: z.object({ param1: z.string() }),
  // NO execute function
},
```

2. Add handler mapping (`packages/plugin/views/assistant/ai-chat/tool-handlers/tool-invocation-handler.tsx`)

3. Create handler component with:
   - `useRef(false)` to prevent double execution
   - Check `!("result" in toolInvocation)` before executing
   - Call `handleAddResult(JSON.stringify(result))` when done
   - Access Obsidian API via `app` prop

## Tech Stack Details

- **Web**: Next.js 15.1.11, React 19, Drizzle ORM, PostgreSQL, TailwindCSS v4
- **Plugin**: TypeScript, React 19, TailwindCSS v3 (with Obsidian variables)
- **Mobile**: Expo SDK 52, React Native 0.76, NativeWind
- **AI SDKs**: Vercel AI SDK (`ai` package), OpenAI, Anthropic, Google, Groq, Mistral, DeepSeek

## Self-Hosted Deployment

A self-hosted instance is deployed on VPS (168.231.76.105):

- **URL**: https://notecomp.neodromes.eu
- **Docker**: `/opt/notecompanion/` with `docker-compose.traefik.yml`
- **Config**: `.env` file with DeepSeek API via OpenAI-compatible endpoint
- **Traefik**: Uses `mytlschallenge` certresolver, `root_default` network

### VPS Commands

```bash
# SSH alias configured
ssh hostinger-vps

# Restart container
cd /opt/notecompanion && docker compose -f docker-compose.traefik.yml restart

# View logs
docker logs notecompanion -f

# Rebuild after code changes
cd /opt/notecompanion && git pull && docker compose -f docker-compose.traefik.yml up -d --build
```

### Obsidian Plugin Config

- Server URL: `https://notecomp.neodromes.eu`
- API Key: Value of `SOLO_API_KEY` in `.env`

## Memory System

Check `/memory/` directory for project learnings before starting tasks. Create new memory files when discovering unexpected behavior: `/memory/YYYY-MM-DD-description.md`
