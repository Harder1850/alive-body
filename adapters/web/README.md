# Web Adapter

Flexible website building and maintenance for alive-body.

**User defines scope. ALIVE executes.**

---

## Capabilities

| Operation | Description |
|-----------|-------------|
| `init` | Create new site from template |
| `page` | Add or update pages |
| `asset` | Add or update assets |
| `file` | Direct file operations |
| `data` | Update site data |
| `build` | Build site (if framework) |
| `deploy` | Deploy to target |
| `status` | Get site info |

---

## Supported Site Types

- **static** — Plain HTML/CSS/JS
- **markdown** — Markdown → HTML
- **react** — React SPA
- **next** — Next.js
- **hugo** — Hugo static site
- **custom** — User-defined

---

## Deploy Targets

- **local** — Files only
- **github** — GitHub Pages
- **vercel** — Vercel
- **netlify** — Netlify
- **ftp** — FTP/SFTP

---

## Quick Start

### Initialize a new site

```typescript
import { webRequest } from './adapters/web/index.js';

const response = await webRequest({
  operation: 'init',
  siteId: 'tribal-wind',
  payload: {
    name: 'Yurok Tribal Wind Project',
    type: 'static',
    template: 'static-landing',
    variables: {
      siteName: 'Yurok Wind Energy',
      siteDescription: 'Sustainable energy for tribal sovereignty',
      heroTitle: 'Powering Our Future',
      heroSubtitle: 'Clean energy, tribal ownership',
      ctaText: 'Learn More',
      ctaLink: '#about'
    },
    deploy: {
      target: 'github',
      repo: 'git@github.com:YurokTribe/wind-project.git',
      branch: 'gh-pages'
    }
  }
});
```

### Add a page

```typescript
await webRequest({
  operation: 'page',
  siteId: 'tribal-wind',
  payload: {
    path: '/about',
    title: 'About the Project',
    content: '<h1>About</h1><p>Our wind energy initiative...</p>',
    format: 'html',
    meta: {
      description: 'About the Yurok Tribal Wind Project'
    }
  }
});
```

### Update content with host data

```typescript
await webRequest({
  operation: 'data',
  siteId: 'tribal-wind',
  payload: {
    global: {
      councilMembers: ['Alice', 'Bob', 'Carol'],
      lastUpdated: '2024-01-15'
    },
    pages: {
      '/team': {
        members: [
          { name: 'Alice', role: 'Director' },
          { name: 'Bob', role: 'Engineer' }
        ]
      }
    }
  }
});
```

### Deploy

```typescript
await webRequest({
  operation: 'deploy',
  siteId: 'tribal-wind'
});
```

---

## Direct File Operations

```typescript
// Create file
await webRequest({
  operation: 'file',
  siteId: 'tribal-wind',
  payload: {
    type: 'create',
    path: 'data/projects.json',
    content: JSON.stringify(projectData)
  }
});

// Read file
const response = await webRequest({
  operation: 'file',
  siteId: 'tribal-wind',
  payload: {
    type: 'read',
    path: 'data/projects.json'
  }
});

// Delete file
await webRequest({
  operation: 'file',
  siteId: 'tribal-wind',
  payload: {
    type: 'delete',
    path: 'old-page.html'
  }
});
```

---

## Available Templates

| Template | Type | Description |
|----------|------|-------------|
| `static-basic` | static | Multi-page HTML site |
| `static-landing` | static | Single-page landing |
| `markdown-blog` | markdown | Blog with posts |

### List templates

```typescript
import { listTemplates } from './adapters/web/index.js';

const templates = listTemplates();
// or filter by type
const staticTemplates = listTemplates('static');
```

---

## Architecture

```
adapters/web/
├── webAdapter.ts       # Main adapter (request routing)
├── webTypes.ts         # Type definitions
├── fileManager.ts      # File CRUD operations
├── templateManager.ts  # Site templates
├── deployManager.ts    # Deployment handlers
└── index.ts            # Public exports
```

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ALIVE_SITES_DIR` | Base directory for sites | `./sites` |

---

## Flexibility Principle

ALIVE does **exactly what the user defines**:

- Small edit? Update one file.
- New section? Add one page.
- Full redesign? Reinitialize with new template.
- Just data? Update `site.data.json`.
- Deploy only? Call deploy.

No assumptions. No automation beyond request.

---

## Prohibitions

This adapter:
- ❌ Does NOT decide content
- ❌ Does NOT choose designs
- ❌ Does NOT optimize SEO
- ❌ Does NOT track analytics
- ❌ Does NOT auto-deploy

User owns decisions. ALIVE owns execution.
