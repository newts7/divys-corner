# Divy's

A retro paper-styled personal journal blog.

## Quick Start

```bash
npm install
npm run build
npm run dev     # builds and serves locally
```

## Writing Posts

Create a new `.md` file in the `posts/` folder:

```markdown
---
title: Your Post Title
date: 2024-01-20
excerpt: A brief description of your post.
---

Your content here. Write in **markdown**.

## Headings work

So do `code blocks`, lists, and [links](https://example.com).
```

Then run `npm run build` to generate the static files.

## Project Structure

```
├── posts/           # Your markdown blog posts
├── public/          # Static assets (CSS, images)
├── dist/            # Generated site (deploy this)
├── build.js         # Build script
└── package.json
```

## Deployment

Deploy the `dist/` folder to any static host:
- GitHub Pages
- Netlify
- Vercel
- Cloudflare Pages

## Front Matter Options

| Field     | Required | Description                    |
|-----------|----------|--------------------------------|
| `title`   | Yes      | Post title                     |
| `date`    | Yes      | Publication date (YYYY-MM-DD)  |
| `excerpt` | No       | Short description for listing  |
| `draft`   | No       | Set to `true` to hide post     |
# divys-corner
