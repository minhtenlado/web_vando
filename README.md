# Phan Huỳnh — Portfolio

Personal portfolio for Embedded Systems, IoT, Robotics, and Edge AI. Built with Next.js App Router, React, TypeScript, Tailwind CSS, and Radix UI.

## Run locally

```sh
npm ci
npm run dev
```

Open http://localhost:3000. When `DATABASE_URL` is absent, the public pages use a bundled snapshot of the existing published portfolio. This lets you preview real projects and articles without production credentials. The snapshot is never used to replace deliberately empty or deleted content in a configured database.

## Production build

```sh
npm run build
npm start
```

Local builds create a standalone Node server and copy its static assets with a cross-platform Node script. Vercel continues using the existing Next.js project configuration and environment variables.

## Deployment

The canonical domain remains https://phanhuynh.id.vn. Merge the rebuild branch into the production branch connected to the existing Vercel project to deploy. No DNS, project migration, database migration, or new hosting provider is required.

Retain the existing Vercel environment variables for the database, admin authentication, uploads, contact notifications, and AI provider. Local snapshot mode previews public content; submitting contact messages, comments, and AI requests still requires their configured backend services.

## Editing content

The existing `/admin` CMS and API routes are retained. Projects keep their original IDs, articles keep their slugs, and language switching reloads the corresponding CMS content. Public data excludes drafts and private administration settings.

The new homepage is `src/components/cv/portfolio-home.tsx`. Public layout styling is in `src/app/portfolio.css`; shared controls use tokens in `src/app/globals.css`. Contact and detail-page styles are isolated in their own stylesheets.

## Interface features

- Responsive vertical navigation, project filters, and search
- Vietnamese and English, persistent light/dark themes
- Keyboard search with Ctrl/Cmd+K
- Accessible contact dialog, labelled inputs, validation, and submission feedback
- Optimized responsive images and self-hosted fonts
- Reduced-motion support, project case studies, article reader, and original engagement features
- Canonical metadata, social preview, structured data, and published-content sitemap
