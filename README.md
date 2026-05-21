# PDF Manager

A full-featured PDF management application built with React, TypeScript, and Lovable Cloud. Upload, organize, summarize, and manage your PDF documents with an elegant, modern interface.

## Features

### Authentication & User Management
- **Secure Authentication** — Email-based sign up and sign in powered by Lovable Cloud Auth.
- **Role-Based Access Control** — Two-tier role system (`user` and `admin`) with automatic profile creation on signup.
- **Admin Panel** — Admins can view all users and PDFs, promote or demote user roles, delete users (along with their PDFs), and delete any PDF across the platform.

### PDF Management
- **Drag & Drop Upload** — Upload PDFs with an intuitive drag-and-drop interface. Supports selecting a destination folder before uploading.
- **Secure Storage** — PDFs are stored securely via Lovable Cloud Storage with signed URLs for access.
- **Built-in PDF Viewer** — Preview uploaded PDFs directly in the app with an embedded viewer.
- **PDF Deletion** — Remove PDFs you no longer need, with automatic cleanup of storage and database records.
- **Search & Filter** — Search your PDF library by filename and filter by folder.
- **Move Between Folders** — Reorganize PDFs by moving them into different folders after upload.

### Folder Organization
- **Custom Folders** — Create named folders to categorize your PDFs.
- **Color Coding** — Assign colors to folders for visual organization.
- **Folder Filtering** — Click a folder in the sidebar to view only PDFs within that folder.
- **Quick Select** — Choose a folder before uploading to automatically categorize new PDFs.

### AI-Powered Summarization
- **One-Click Summarize** — Generate AI summaries of any uploaded PDF with a single click.
- **Gemini-Powered** — Uses `google/gemini-3-flash-preview` via the Lovable AI Gateway for fast, high-quality summaries.
- **Persistent Summaries** — Generated summaries are saved to the database so you can revisit them anytime.
- **Regenerate** — Re-run summarization if needed to get a fresh summary.

### Dashboard & Analytics
- **Storage Stats** — Real-time display of total PDF count and combined file size in the sidebar.
- **Responsive Layout** — Collapsible stats on mobile, full sidebar on desktop.

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite 5, Tailwind CSS, shadcn/ui
- **Backend:** Lovable Cloud (PostgreSQL, Authentication, File Storage, Edge Functions)
- **AI:** Lovable AI Gateway with Gemini models
- **State Management:** React hooks (custom `useAuth`, `usePdfs`, `useFolders`, `useUserRole`, `useAdminData`)
- **UI Components:** Radix UI primitives via shadcn/ui
- **Date Formatting:** date-fns

## Database Schema

```
profiles          — user profiles linked to auth users
user_roles        — role assignments (admin | user)
folders           — user-created folders with color labels
pdfs              — uploaded PDF metadata with folder_id and summary
```

- Row-Level Security (RLS) ensures users can only access their own data.
- Admins bypass RLS via the `has_role()` security definer function to manage all users and PDFs.

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
  components/       # React components
    AuthForm.tsx    — Login / signup form
    Dashboard.tsx   — Main dashboard layout
    PdfUpload.tsx   — Drag-and-drop PDF upload
    PdfList.tsx     — PDF grid with search, folder filter, and actions
    PdfViewer.tsx   — Embedded PDF preview
    PdfSummary.tsx  — AI summary modal
    FolderManager.tsx — Sidebar folder creation and selection
    AdminPanel.tsx  — Admin user & PDF management
  hooks/            # Custom React hooks
    useAuth.ts      — Authentication state & methods
    usePdfs.ts      — PDF CRUD operations
    useFolders.ts   — Folder CRUD operations
    useUserRole.ts  — Current user role detection
    useAdminData.ts — Admin data fetching & mutations
  integrations/     # Lovable Cloud client configuration
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
