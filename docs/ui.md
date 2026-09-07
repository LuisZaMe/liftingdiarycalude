# UI Coding Standards

These standards govern **all** UI work in this project. Read this file before creating or
editing any component, page, or layout.

---

## 1. The Core Rule: shadcn/ui Only

> **ONLY shadcn/ui components may be used for the UI in this project.**
> **ABSOLUTELY NO custom components are to be created.**

Every visual element on screen must come from a shadcn/ui component installed into
`src/components/ui/`. This is not a preference or a default — it is a hard constraint with
no exceptions.

**This means you must NOT:**

- Hand-write a new component that reproduces something shadcn/ui already provides
  (no bespoke `<Modal>`, `<Btn>`, `<DataTable>`, `<Spinner>`, `<Badge>`, `<Tabs>`, …).
- Wrap a shadcn/ui component in a "convenience" component with a new name and a new API.
- Build UI primitives directly out of raw `<div>` / `<button>` / `<input>` elements with
  Tailwind classes when a shadcn/ui component exists for that purpose.
- Pull in a different component library (Material UI, Chakra, Mantine, Ant Design, Headless UI,
  DaisyUI, …) or copy a component in from a blog post, gist, or another project.
- Import Radix or Base UI primitives directly. They are transitive dependencies of shadcn/ui
  and are consumed *through* shadcn/ui components, never directly in feature code.

**If a component you need is not yet installed, install it — do not write it.**

### Adding a component

```bash
npx shadcn@latest add <component-name>
```

This writes the component into `src/components/ui/` using the project's configured style. Then
import it and use it. Adding a component from the shadcn/ui registry is always the correct move;
writing one by hand never is.

### Currently installed components

`src/components/ui/`:

`alert-dialog` · `button` · `calendar` · `card` · `dialog` · `dropdown-menu` · `form` ·
`input` · `label` · `popover` · `select` · `table`

Anything beyond this list must be installed via the CLI before use.

### If no shadcn/ui component fits

Do **not** improvise one. In order:

1. Re-check the shadcn/ui registry — the component very likely exists under a different name.
2. Compose the UI from existing shadcn/ui components (they are designed to nest and combine).
3. If it still cannot be built from the registry, **stop and raise it with the user** rather
   than authoring a custom component.

---

## 2. Project Configuration

Defined in `components.json` — do not change these values ad hoc:

| Setting | Value |
| --- | --- |
| Style | `base-vega` |
| Base color | `neutral` |
| CSS variables | enabled |
| RSC | enabled |
| Icon library | `lucide-react` |
| Components alias | `@/components` |
| UI alias | `@/components/ui` |
| Utils alias | `@/lib/utils` |
| Global stylesheet | `src/app/globals.css` |

Icons come from `lucide-react` only. No other icon set, no inline hand-drawn SVG icons.

---

## 3. Usage Rules

### Imports

Always import from the `@/components/ui` alias, one component per module path:

```tsx
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
```

Never use deep relative paths (`../../components/ui/button`).

### Composition over abstraction

Compose shadcn/ui parts directly in the page or feature file. Use the sub-components the
library ships with rather than collapsing them into a new abstraction:

```tsx
// Correct — composed from shadcn/ui parts in place
<Card>
  <CardHeader>
    <CardTitle>Bench Press</CardTitle>
  </CardHeader>
  <CardContent>{/* ... */}</CardContent>
</Card>
```

```tsx
// Wrong — a custom component wrapping shadcn/ui
export function WorkoutCard({ title, children }) {
  return <div className="rounded-lg border p-4">{/* ... */}</div>
}
```

Composing components inside a page or route file is expected and correct. What is prohibited is
creating **new reusable UI primitives**.

### Variants and styling

- Use the component's own `variant` and `size` props first (`<Button variant="destructive" size="sm">`).
- Never fork or re-implement a component to get a new look.
- Do not edit files in `src/components/ui/` to change appearance for one screen. Those files are
  registry output and should stay close to upstream so they can be updated.
- Additional Tailwind classes via `className` are acceptable **only** for layout and spacing
  (margins, grid/flex placement, width). Do not use `className` to override a component's core
  colors, borders, radii, or typography — that defeats the design system.
- Merge classes with the `cn()` helper from `@/lib/utils`.

### Layout and theming

- Layout with plain Tailwind utilities on `div`/`section` elements is fine — layout containers
  are not components.
- Use design tokens (`bg-background`, `text-foreground`, `text-muted-foreground`, `border`,
  `bg-primary`, …) rather than hard-coded colors like `bg-white` or `text-gray-500`. Tokens keep
  light and dark themes correct.
- Theming is handled by `next-themes` through the existing `theme-provider` and `theme-toggle`.
  Do not add a second theming mechanism.

### Forms

All forms use the shadcn/ui `form` component with `react-hook-form` and a `zod` schema resolved
through `@hookform/resolvers`. Use `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`,
`FormMessage` — do not hand-roll form field markup, labels, or error text.

### Accessibility

shadcn/ui components are accessible as shipped. Preserve that: keep `Label` associated with its
control, keep dialogs' titles and descriptions in place, and never strip ARIA attributes or
replace a semantic control with a styled `div`.

---

## 4. Date Formatting Standards

### Library

Use `date-fns` for **all** date formatting operations. Do not use `toLocaleDateString`,
`Intl.DateTimeFormat`, or manual string building.

### Format Specification

Dates must be formatted using ordinal indicators, exactly as follows:

- 1st Sep 2025
- 2nd Aug 2025
- 3rd Jan 2026
- 4th Jun 2024

### Format Pattern

- Day with ordinal suffix (1st, 2nd, 3rd, 4th, etc.)
- Abbreviated month name (3 letters)
- Full year (4 digits)

### Implementation

This is the `"do MMM yyyy"` format string in `date-fns`:

```tsx
import { format } from "date-fns"

format(new Date(2025, 8, 1), "do MMM yyyy")  // "1st Sep 2025"
format(new Date(2025, 7, 2), "do MMM yyyy")  // "2nd Aug 2025"
format(new Date(2026, 0, 3), "do MMM yyyy")  // "3rd Jan 2026"
format(new Date(2024, 5, 4), "do MMM yyyy")  // "4th Jun 2024"
```

Apply this format consistently to every user-facing date across the entire project.

---

## 5. Checklist Before Committing UI Code

- [ ] Every UI element comes from a shadcn/ui component in `src/components/ui/`.
- [ ] No new custom component was created.
- [ ] Any newly needed component was installed via `npx shadcn@latest add`.
- [ ] Imports use the `@/components/ui/*` alias.
- [ ] No files in `src/components/ui/` were edited for one-off styling.
- [ ] Icons are from `lucide-react`.
- [ ] Colors use design tokens, not hard-coded values.
- [ ] Forms use the shadcn/ui `form` + `react-hook-form` + `zod` pattern.
- [ ] All dates are formatted with `date-fns` as `"do MMM yyyy"`.
