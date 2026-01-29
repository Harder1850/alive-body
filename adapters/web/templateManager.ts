/**
 * Template Manager
 * 
 * Provides starting templates for various site types.
 * Templates are data, not logic.
 */

import { TemplateDefinition, SiteType } from './webTypes.js';

/**
 * Get template by ID.
 */
export function getTemplate(id: string): TemplateDefinition | null {
  return TEMPLATES[id] || null;
}

/**
 * List available templates.
 */
export function listTemplates(type?: SiteType): TemplateDefinition[] {
  const all = Object.values(TEMPLATES);
  if (type) {
    return all.filter(t => t.type === type);
  }
  return all;
}

// ============================================
// Built-in Templates
// ============================================

const TEMPLATES: Record<string, TemplateDefinition> = {
  
  // Basic static HTML site
  'static-basic': {
    id: 'static-basic',
    name: 'Basic Static Site',
    type: 'static',
    description: 'Simple HTML/CSS site with clean structure',
    variables: ['siteName', 'siteDescription'],
    files: [
      {
        path: 'index.html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{siteName}}</title>
  <meta name="description" content="{{siteDescription}}">
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <header>
    <nav>
      <a href="/" class="logo">{{siteName}}</a>
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/about.html">About</a></li>
        <li><a href="/contact.html">Contact</a></li>
      </ul>
    </nav>
  </header>
  
  <main>
    <h1>Welcome to {{siteName}}</h1>
    <p>{{siteDescription}}</p>
  </main>
  
  <footer>
    <p>&copy; {{year}} {{siteName}}</p>
  </footer>
  
  <script src="js/main.js"></script>
</body>
</html>`
      },
      {
        path: 'css/style.css',
        content: `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --primary: #2563eb;
  --text: #1f2937;
  --bg: #ffffff;
  --muted: #6b7280;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: var(--text);
  background: var(--bg);
  line-height: 1.6;
}

header {
  padding: 1rem 2rem;
  border-bottom: 1px solid #e5e7eb;
}

nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

nav .logo {
  font-weight: 600;
  font-size: 1.25rem;
  color: var(--primary);
  text-decoration: none;
}

nav ul {
  display: flex;
  gap: 2rem;
  list-style: none;
}

nav a {
  color: var(--text);
  text-decoration: none;
}

nav a:hover {
  color: var(--primary);
}

main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem 2rem;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

footer {
  padding: 2rem;
  text-align: center;
  color: var(--muted);
  border-top: 1px solid #e5e7eb;
}

@media (max-width: 768px) {
  nav {
    flex-direction: column;
    gap: 1rem;
  }
  
  nav ul {
    gap: 1rem;
  }
  
  h1 {
    font-size: 2rem;
  }
}`
      },
      {
        path: 'js/main.js',
        content: `// Site JavaScript
document.addEventListener('DOMContentLoaded', () => {
  console.log('Site loaded');
});`
      },
      {
        path: 'about.html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>About - {{siteName}}</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <header>
    <nav>
      <a href="/" class="logo">{{siteName}}</a>
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/about.html">About</a></li>
        <li><a href="/contact.html">Contact</a></li>
      </ul>
    </nav>
  </header>
  
  <main>
    <h1>About Us</h1>
    <p>Learn more about {{siteName}}.</p>
  </main>
  
  <footer>
    <p>&copy; {{year}} {{siteName}}</p>
  </footer>
</body>
</html>`
      },
      {
        path: 'contact.html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contact - {{siteName}}</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <header>
    <nav>
      <a href="/" class="logo">{{siteName}}</a>
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/about.html">About</a></li>
        <li><a href="/contact.html">Contact</a></li>
      </ul>
    </nav>
  </header>
  
  <main>
    <h1>Contact</h1>
    <p>Get in touch with {{siteName}}.</p>
  </main>
  
  <footer>
    <p>&copy; {{year}} {{siteName}}</p>
  </footer>
</body>
</html>`
      }
    ]
  },

  // Landing page
  'static-landing': {
    id: 'static-landing',
    name: 'Landing Page',
    type: 'static',
    description: 'Single-page landing site with sections',
    variables: ['siteName', 'siteDescription', 'heroTitle', 'heroSubtitle', 'ctaText', 'ctaLink'],
    files: [
      {
        path: 'index.html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{siteName}}</title>
  <meta name="description" content="{{siteDescription}}">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header>
    <nav>
      <span class="logo">{{siteName}}</span>
      <a href="{{ctaLink}}" class="cta-btn">{{ctaText}}</a>
    </nav>
  </header>

  <section class="hero">
    <h1>{{heroTitle}}</h1>
    <p>{{heroSubtitle}}</p>
    <a href="{{ctaLink}}" class="cta-btn large">{{ctaText}}</a>
  </section>

  <section class="features">
    <div class="feature">
      <h3>Feature One</h3>
      <p>Description of the first feature.</p>
    </div>
    <div class="feature">
      <h3>Feature Two</h3>
      <p>Description of the second feature.</p>
    </div>
    <div class="feature">
      <h3>Feature Three</h3>
      <p>Description of the third feature.</p>
    </div>
  </section>

  <footer>
    <p>&copy; {{year}} {{siteName}}</p>
  </footer>
</body>
</html>`
      },
      {
        path: 'style.css',
        content: `* { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --primary: #2563eb;
  --primary-dark: #1d4ed8;
  --text: #1f2937;
  --bg: #ffffff;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: var(--text);
  line-height: 1.6;
}

header {
  padding: 1rem 2rem;
  position: fixed;
  width: 100%;
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(10px);
  z-index: 100;
}

nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.logo {
  font-weight: 700;
  font-size: 1.5rem;
  color: var(--primary);
}

.cta-btn {
  background: var(--primary);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  transition: background 0.2s;
}

.cta-btn:hover {
  background: var(--primary-dark);
}

.cta-btn.large {
  padding: 1rem 2rem;
  font-size: 1.1rem;
}

.hero {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 2rem;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
}

.hero h1 {
  font-size: 3.5rem;
  margin-bottom: 1rem;
  max-width: 800px;
}

.hero p {
  font-size: 1.25rem;
  color: #4b5563;
  margin-bottom: 2rem;
  max-width: 600px;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  padding: 6rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.feature {
  padding: 2rem;
  border-radius: 12px;
  background: #f9fafb;
}

.feature h3 {
  margin-bottom: 0.5rem;
  color: var(--primary);
}

footer {
  padding: 3rem 2rem;
  text-align: center;
  background: #f9fafb;
  color: #6b7280;
}

@media (max-width: 768px) {
  .hero h1 { font-size: 2.5rem; }
  .hero p { font-size: 1rem; }
}`
      }
    ]
  },

  // Markdown blog
  'markdown-blog': {
    id: 'markdown-blog',
    name: 'Markdown Blog',
    type: 'markdown',
    description: 'Simple blog with markdown posts',
    variables: ['siteName', 'siteDescription', 'authorName'],
    files: [
      {
        path: 'site.json',
        content: `{
  "name": "{{siteName}}",
  "description": "{{siteDescription}}",
  "author": "{{authorName}}",
  "navigation": [
    { "label": "Home", "path": "/" },
    { "label": "Blog", "path": "/blog" },
    { "label": "About", "path": "/about" }
  ]
}`
      },
      {
        path: 'content/index.md',
        content: `---
title: Home
template: home
---

# Welcome to {{siteName}}

{{siteDescription}}`
      },
      {
        path: 'content/about.md',
        content: `---
title: About
template: page
---

# About

Written by {{authorName}}.`
      },
      {
        path: 'content/blog/first-post.md',
        content: `---
title: First Post
date: {{date}}
template: post
---

# First Post

This is your first blog post.`
      },
      {
        path: 'templates/base.html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{title}} - {{site.name}}</title>
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <header>
    <nav>
      <a href="/" class="logo">{{site.name}}</a>
      <ul>
        {{#each site.navigation}}
        <li><a href="{{path}}">{{label}}</a></li>
        {{/each}}
      </ul>
    </nav>
  </header>
  <main>
    {{{content}}}
  </main>
  <footer>
    <p>&copy; {{year}} {{site.name}}</p>
  </footer>
</body>
</html>`
      },
      {
        path: 'style.css',
        content: `* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: Georgia, serif; line-height: 1.8; color: #333; max-width: 800px; margin: 0 auto; padding: 2rem; }
header { margin-bottom: 3rem; padding-bottom: 1rem; border-bottom: 1px solid #eee; }
nav { display: flex; justify-content: space-between; align-items: center; }
.logo { font-size: 1.5rem; font-weight: bold; text-decoration: none; color: #333; }
nav ul { display: flex; gap: 1.5rem; list-style: none; }
nav a { color: #666; text-decoration: none; }
nav a:hover { color: #000; }
main { min-height: 60vh; }
h1 { font-size: 2.5rem; margin-bottom: 1rem; }
h2 { font-size: 1.75rem; margin: 2rem 0 1rem; }
p { margin-bottom: 1rem; }
footer { margin-top: 3rem; padding-top: 1rem; border-top: 1px solid #eee; color: #999; }`
      }
    ]
  }
};

/**
 * Apply variables to template content.
 */
export function applyVariables(
  content: string,
  variables: Record<string, string>
): string {
  let result = content;
  
  // Add built-in variables
  const allVars = {
    ...variables,
    year: new Date().getFullYear().toString(),
    date: new Date().toISOString().split('T')[0]
  };
  
  for (const [key, value] of Object.entries(allVars)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(regex, value);
  }
  
  return result;
}

export default {
  getTemplate,
  listTemplates,
  applyVariables
};
