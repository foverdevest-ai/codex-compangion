# Codex Companion Design System

This implementation uses the supplied Personeel.com design system share bundle as the visual foundation. Core imported decisions include Montserrat headings, Open Sans body text, orange primary actions, blue secondary accents, pill controls, glass panels, and the provided semantic token naming pattern.

## Principles

- Approval-first: pending approval state is treated like a production incident, not a passive notification.
- Dense but calm: show useful operational context without decorative clutter.
- Mobile continuity: every critical workflow must work one-handed on a phone.
- Auditable decisions: approval actions must show reason, target, risk, and run linkage.
- Progressive disclosure: lists stay scannable; drawers and panels carry detail.

## Typography

- Heading font: Montserrat.
- Body font: Open Sans.
- Display: 32/40, semibold, used only for page-level home or empty-state anchors.
- H1: 24/32, semibold.
- H2: 20/28, semibold.
- H3: 16/24, semibold.
- Body: 14/22, regular.
- Small: 12/18, medium for metadata, timestamps, and badges.

## Spacing

- 4px base grid.
- Page gutter: 24px desktop, 16px tablet, 12px mobile.
- Panel padding: 20px desktop, 16px mobile.
- List row gap: 10px.
- Control height: 40px default, 44px touch-critical mobile actions.

## Radius

- 8px: compact chips and minor controls.
- 12px: inputs and dense interactive surfaces.
- 24px: glass panels and major cards.
- 9999px: buttons, badges, pills, and segmented filters.

## Color System

- Surface: `--background`, `--card`, `--muted`.
- Text: `--foreground`, `--muted-foreground`.
- Border: `--border`.
- Primary action: Personeel orange `#fd5e2d`.
- Accent: Personeel dashboard blue `#4356ff`.
- Focus: Personeel blue `#1198da`.
- Destructive: red for reject, failed, delete, and critical warnings.
- Warning: amber for waiting approval and medium risk.
- Success: green for approved and completed.
- Info: blue for running and streamed output.

## Semantic Statuses

- Run queued: gray badge.
- Run running: blue badge with live indicator.
- Run waiting approval: amber badge and global banner.
- Run completed: green badge.
- Run failed: red badge.
- Approval pending: amber, visually prominent.
- Approval approved: green.
- Approval rejected: red.
- Approval expired/cancelled: muted gray.

## Approval UI Patterns

- Global pending approval banner appears above page content and links to Approvals.
- Approval list rows include project, thread, risk, target resource, and requested time.
- Approval detail drawer/modal must include title, summary, detailed reason, raw action context, run linkage, and decision history.
- Approve and reject buttons are always visible in the approval detail footer.
- On mobile, approval actions are sticky at the bottom with safe-area padding.
- High and critical risk approvals require stronger visual emphasis and clear target resource display.

## Thread UI Patterns

- Thread detail has sticky header with project, run state, and pending approval badge.
- Timeline uses compact message blocks with role, timestamp, and run metadata chips.
- Composer is sticky on mobile and preserves drafts.
- Inline approval banners appear at the relevant timeline point.
- Artifact links sit in a side panel on desktop and a stacked section on mobile.

## Mobile Layout Rules

- Use bottom navigation for Home, Threads, Approvals, and Compose access.
- Sidebar collapses into compact top context plus bottom nav.
- Primary touch targets are at least 44px tall.
- Keep approval actions reachable without scrolling the entire detail sheet.
- Use `env(safe-area-inset-bottom)` for sticky composer and action bars.

## Accessibility

- All controls need visible focus rings.
- Badges cannot rely on color alone; include text labels.
- Dialogs trap focus and expose clear labels.
- Use semantic headings per page.
- Maintain WCAG AA contrast in light and dark themes.
- Streaming updates should use polite live regions where appropriate.

## Notifications

- Pending approvals: persistent banner, nav badge, inbox item, thread badge.
- Failed runs: inbox item and page badge.
- Connection issues: top non-blocking banner with retry status.
- Browser push scaffolding should request permission only after explicit user action.

## Banners

- Approval banner: amber, sticky under app header, includes count and route to Approvals.
- Error banner: red, concise problem and action.
- Sync banner: blue or gray depending on recoverability.

## Drawer / Modal Patterns

- Desktop: right-side detail drawer for approvals and artifacts.
- Mobile: full-screen or bottom sheet style modal with sticky action footer.
- Header shows title, risk, status, and timestamp.
- Body separates context, target, raw payload, and history.
