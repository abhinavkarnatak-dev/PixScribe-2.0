# PixScribe 2.0

Prompt-to-image generation with a credit system, built on Next.js 16, MongoDB,
and the ClipDrop API. A full rebuild of the v1 MERN app (Vite client + Express
server) as a single typed Next.js application.

## Stack

| Concern    | Choice                                        |
| ---------- | --------------------------------------------- |
| Framework  | Next.js 16 (App Router, Turbopack), React 19.2 |
| Language   | TypeScript                                     |
| Database   | MongoDB via Mongoose 9                         |
| Styling    | Tailwind CSS v4 (CSS-first `@theme`)           |
| Animation  | Motion 12                                      |
| Auth       | Custom JWT (jose) in an httpOnly cookie        |
| Images     | ClipDrop text-to-image                         |
| Storage    | Cloudinary                                     |
| Payments   | Razorpay                                       |
| Validation | Zod 4                                          |

## Getting started

```bash
npm install
cp .env.example .env   # then fill in the values
npm run dev
```

Every variable is documented in `.env.example`. All of them are required except
`RAZORPAY_WEBHOOK_SECRET` - see [Payments](#payments) for why that one is
optional.

## Architecture

```
src/
  app/
    (site)/        Landing, pricing, explore, studio, gallery, account, legal
    (auth)/        Login and signup, standalone split-screen layout
    api/           Route handlers - thin, no business logic
  components/
    ui/            Primitives: Button, Field, Dialog, CreditPill, AuroraBackdrop
    marketing/     Landing page sections
    studio/        Prompt composer, preset picker, result canvas
    gallery/       Shared grid used by both the private gallery and Explore
    pricing/       Plan cards and the Razorpay checkout hook
    account/       Profile, stats, transactions, password change
    legal/         Shared shell for the three legal documents
    providers/     Auth and toast context
  config/          Plans, style presets, site copy - client-safe, no secrets
  lib/
    db/            Connection + Mongoose models
    auth/          Session signing, password hashing, route guard
    validation/    Zod schemas shared by client forms and API routes
    api/           Response helpers and the error wrapper
  server/          Server-only: ClipDrop client, key rotator, storage, services
  proxy.ts         Route gating (Next 16's rename of middleware)
```

The layering rule: **route handlers parse and delegate, services hold the
business logic, models hold the shape.** No database calls or third-party
requests live in a route handler or a component.

Every module under `src/server/` and `src/lib/db/` imports `server-only`, so
importing one from a client component is a build error rather than a leaked API
key.

## Key design decisions

### ClipDrop key rotation

Six keys rotate round-robin so no single key's quota is drained. Two things
differ from v1, which kept the index in a module-level variable:

- The cursor lives in MongoDB and advances with an atomic `$inc`, so rotation
  stays fair across cold starts and concurrent serverless instances. Two
  simultaneous requests are guaranteed different keys.
- A key that fails is put on a cooldown scaled to the failure class (2 min for a
  429, 1 hour for a quota exhaustion, 6 hours for a bad credential) and skipped.
  The request falls through to the next key instead of failing outright.

A 4xx that is not a credential or quota problem stops the rotation, since a
different key will not fix a rejected prompt.

### Credits are race-safe

v1 read the balance, called ClipDrop, then wrote `balance - 1`. Two concurrent
requests read the same balance and both got an image for one credit.

Here, a credit is reserved **before** any provider work with a single
conditional update:

```ts
UserModel.findOneAndUpdate(
  { _id: userId, credits: { $gte: 1 } },
  { $inc: { credits: -1 } },
);
```

Mongo evaluates the filter and the increment together under a document lock, so
exactly one of two simultaneous requests wins when the balance is 1. Every
failure path after that point refunds the credit.

### Payments

Credits are granted only after the Razorpay signature is verified server-side
with an HMAC over `order_id|payment_id`, compared in constant time. The browser's
success callback is never trusted on its own - v1 only re-read the order status
using an order id the client supplied.

Order amounts come from the server-side plan table, never the request body.

Settlement is idempotent. The update that grants credits filters on
`creditsGranted: false`, so only one caller can ever flip it no matter how many
paths fire concurrently.

Three paths can settle an order:

1. **Checkout callback** - immediate, what the user normally sees.
2. **Webhook** (`/api/payments/webhook`) - authoritative, optional. Requires
   `RAZORPAY_WEBHOOK_SECRET`; while blank the endpoint refuses every request.
3. **Reconciliation** (`/api/payments/reconcile`) - runs on pricing and account
   page load, asks Razorpay about unsettled orders from the last 24 hours and
   grants anything that was actually paid.

Path 3 is why the webhook is optional: a payment that completes while the user
closes the tab is still recovered on their next visit.

### Rate limiting

Fixed-window counters in MongoDB with a TTL index, so limits hold across
instances rather than resetting per process. Generation is limited per account
(8/min) because the protected resources are the user's balance and shared
ClipDrop quota; auth routes are limited per IP.

### Auth

Session JWT in an httpOnly, sameSite=lax cookie - not localStorage, so page
scripts cannot read it. Passwords are bcrypt at 12 rounds. Login runs a dummy
bcrypt comparison on the unknown-email branch and returns an identical message,
so neither timing nor wording reveals whether an email is registered.

`src/proxy.ts` gates routes optimistically to avoid an app-shell flash. It is
not the authorisation boundary - every page and route handler independently
calls `readSession`/`requireSession`.

## What changed from v1

**Kept:** prompt-to-image generation, 6-key rotation, credit system, Razorpay
plans, the marquee of real PixScribe generations (the original seven PNGs, now
in `public/showcase/`), download.

**Added:** persistent gallery (v1 returned a base64 data URL and lost it on
refresh), style presets, public community showcase, account and billing page,
password change, legal pages, rate limiting, transaction records with status.

**Fixed:** the credit race condition, in-memory rotation state, missing payment
signature verification, JWT in localStorage, and the single conditional-render
auth modal (now dedicated `/login` and `/signup` pages with inline validation,
loading and error states, and a password visibility toggle).

**Pricing:** price points are unchanged, credit allocations were raised so the
per-image cost actually falls across tiers - Rs 3.27 / 2.65 / 2.00, a 0/19/39
percent discount curve. v1's curve was 0/19/32 with a thin 10-image entry pack.

Free signup credits are **3**. Note that v1's `userModel` defaulted to 5 despite
the product describing 3.

## Scripts

```bash
npm run dev     # dev server
npm run build   # production build
npm start       # serve the production build
npm run lint    # eslint
```
