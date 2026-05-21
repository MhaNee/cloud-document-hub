# PDF Manager

A full-featured PDF management application built with React, TypeScript, and Lovable Cloud. Upload, organize, summarize, and manage your PDF documents with an elegant, modern interface.

## Features

- **Authentication** — Secure email-based sign up and sign in with Lovable Cloud.
- **PDF Upload** — Drag & drop PDF files with upload progress tracking and client-side validation.
- **PDF Storage** — Securely store and access PDFs via Lovable Cloud storage.
- **Folder Organization** — Create custom folders with colors and categorize your PDFs.
- **AI Summarization** — Generate concise summaries of PDF content using Lovable AI (Gemini).
- **PDF Viewer** — Built-in embedded PDF viewer for quick previews.
- **Search & Filter** — Search your PDF library and filter by folder.
- **Role-Based Access** — User and admin roles with an admin panel to manage all users and PDFs.
- **Responsive Design** — Fully responsive UI that works across devices.

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite 5, Tailwind CSS, shadcn/ui
- **Backend:** Lovable Cloud (PostgreSQL, Authentication, File Storage, Edge Functions)
- **AI:** Lovable AI Gateway with Gemini models
- **State Management:** React hooks, TanStack Query
- **UI Components:** Radix UI primitives via shadcn/ui

## Getting Started

### Prerequisites

- Node.js & npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Local Development

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm i

# Start the development server
npm run dev
```

The dev server will start with auto-reloading at `http://localhost:5173`.

### Admin Setup

To grant admin privileges to a user, run the following SQL against your database:

```sql
UPDATE user_roles SET role = 'admin' WHERE user_id = 'YOUR_USER_ID';
```

## Project Structure

```
src/
  components/       # React components (Auth, Dashboard, PDF upload/list/viewer, Admin, Folders)
  hooks/            # Custom React hooks (useAuth, usePdfs, useFolders, useUserRole, useAdminData)
  integrations/     # Lovable Cloud / Supabase client configuration
  pages/            # Route pages (Index, NotFound)
  lib/              # Utility functions
  components/ui/    # shadcn/ui component primitives
supabase/
  functions/        # Edge functions (AI summarization)
  migrations/       # Database schema migrations
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the Vite development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

## Deployment

This project is deployed via [Lovable](https://lovable.dev). Open your project and click **Share → Publish** to deploy.

## Custom Domain

You can connect a custom domain to your deployed project:

1. Navigate to **Project → Settings → Domains**
2. Click **Connect Domain**

Read more: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## License

MIT
