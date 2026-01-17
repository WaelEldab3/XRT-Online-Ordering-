# Admin Dashboard

This is the admin dashboard for the XRT Online Ordering System, built with Next.js, React Query, and Tailwind CSS.

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+
- **npm** or **yarn**

### Installation

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment Setup**
   Copy `.env.template` to `.env` and configure your variables:

   ```bash
   cp .env.template .env
   ```

   Ensure `NEXT_PUBLIC_REST_API_ENDPOINT` points to your backend server (e.g., `http://localhost:3001/api/v1`).

3. **Start Development Server**

   ```bash
   npm run dev
   ```

   The dashboard will be available at `http://localhost:3002` (or the port specified in package.json).

## 🛠️ Building for Production

To create an optimized production build:

```bash
npm run build
```

To start the production server:

```bash
npm start
```

## 🏗️ Project Structure

- `src/components`: UI components, organized by feature (auth, item, shop, etc.)
- `src/pages`: Next.js pages (routes)
- `src/data`: API integration hooks (React Query)
- `src/settings`: Site configuration
- `src/utils`: Helper functions and types

## 🧰 Key Technologies

- [Next.js](https://nextjs.org/) - React Framework
- [React Query (TanStack Query)](https://tanstack.com/query/v4) - Data Fetching
- [React Hook Form](https://react-hook-form.com/) - Form Handling
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [i18next](https://www.i18next.com/) - Internationalization
