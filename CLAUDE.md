# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ MANDATORY: Read `/docs` Before Writing Any Code

**This rule is non-negotiable and applies to EVERY code-generating task in this repository.**

Before writing, editing, or reviewing ANY code, Claude Code MUST first read the relevant
documentation file(s) in the `/docs` directory. These files are the single source of truth for
this project's patterns, conventions, and standards. Do NOT rely on general Next.js knowledge,
or on patterns inferred from surrounding code, when a doc exists for that area.

| If the task touches... | ALWAYS read first |
| --- | --- |
| Authentication, sessions, protected routes, user identity | `/docs/auth.md` |
| Reading data, queries, caching, server-side fetching | `/docs/data-fetching.md` |
| Writing data, Server Actions, forms, revalidation | `/docs/data-mutations.md` |
| Pages, layouts, navigation, route structure, params | `/docs/routing.md` |
| Server vs. Client Components, `"use client"`, composition | `/docs/server-components.md` |
| Components, styling, Tailwind, dates, visual design | `/docs/ui.md` |

Rules:

1. **Read before you write.** Consult the docs at the start of the task, not after an
   implementation has been drafted.
2. **Multiple docs may apply.** A single feature often spans several areas (e.g. a form that
   saves data on a protected page → `auth.md` + `data-mutations.md` + `ui.md`). Read all that apply.
3. **If unsure which doc applies, read more of them,** not fewer.
4. **The docs win.** Where the docs conflict with a general convention or with existing code,
   follow the docs and flag the discrepancy.
5. **No exceptions for "small" changes.** One-line edits follow the documented patterns too.

## Project Overview

This is a Next.js 15.5.3 application with TypeScript and Tailwind CSS v4, using the App Router architecture with Turbopack enabled for both development and production builds.

## Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production with Turbopack
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Architecture

- **App Router**: Located at `src/app/` with `layout.tsx` and `page.tsx` files
- **Styling**: Tailwind CSS v4 with PostCSS configuration
- **Path Alias**: `@/*` maps to `./src/*` for cleaner imports
- **Font System**: Uses Geist fonts configured in the root layout
