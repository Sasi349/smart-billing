# Smart Billing System

A professional billing system web app built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Login Page**: Simple authentication with dummy state
- **Dashboard**: Main dashboard with navigation and cards
- **Responsive Design**: Mobile-first approach with desktop optimization
- **Professional UI**: Clean, modern interface with Indigo color palette

## Tech Stack

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **No Backend**: Frontend only with dummy data

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
/app
  /login
    page.tsx          # Login page
  /dashboard
    page.tsx          # Dashboard page
  layout.tsx          # Root layout
  page.tsx            # Redirect to login
  globals.css         # Global styles

/components
  Header.tsx          # Header component with hamburger menu
  Card.tsx            # Reusable card component
```

## Usage

- Navigate to `/login` to see the login page
- Use any email/password combination (dummy authentication)
- After login, you'll be redirected to the dashboard
- Use the hamburger menu to logout

## Design

- **Primary Color**: Indigo (`indigo-600`)
- **Background**: Light gray (`gray-50`)
- **Cards**: White with subtle shadows
- **Responsive**: Mobile-first, desktop optimized
