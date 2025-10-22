# Connect Admin Dashboard

A modern, responsive admin dashboard for the Connect marketplace platform built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **🎨 Modern UI Design** - Clean, professional interface based on provided design mockups
- **📱 Responsive Layout** - Works seamlessly across desktop, tablet, and mobile devices
- **🔐 Authentication** - Login page with form validation and password visibility toggle
- **📊 Dashboard Overview** - Statistics cards, recent orders, and top products
- **👥 User Management** - Reseller management with search, filtering, and actions
- **📦 Product Catalogue** - Product listing with inventory management and filtering
- **⚙️ Settings** - Comprehensive settings with profile, notifications, and security tabs
- **🎯 Interactive Components** - Modals, dropdowns, and dynamic navigation

## Tech Stack

- **Framework**: Next.js 15.5.5 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.0
- **UI Components**: Headless UI
- **Icons**: Lucide React
- **Fonts**: Geist Sans & Geist Mono

## Project Structure

```
src/
├── app/
│   ├── dashboard/          # Main dashboard page
│   ├── login/             # Authentication page
│   ├── users/resellers/   # User management
│   ├── products/listing/  # Product catalogue
│   ├── settings/          # Settings page
│   └── layout.tsx         # Root layout
├── components/
│   ├── DashboardLayout.tsx # Main layout wrapper
│   ├── Sidebar.tsx        # Navigation sidebar
│   ├── Header.tsx         # Top header
│   └── Modal.tsx          # Modal component
└── public/desing/         # Design mockups
```

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser** and navigate to [http://localhost:3000](http://localhost:3000)

## Available Pages

- **Dashboard** (`/dashboard`) - Main overview with statistics and recent activity
- **Login** (`/login`) - Authentication page
- **User Management** (`/users/resellers`) - Reseller management interface
- **Product Catalogue** (`/products/listing`) - Product inventory management
- **Settings** (`/settings`) - User preferences and configuration

## Key Components

### Sidebar Navigation
- Collapsible menu items with icons
- Active state highlighting
- User profile section

### Dashboard Cards
- Statistics overview with trend indicators
- Recent orders table
- Top products listing

### Data Tables
- Search and filtering capabilities
- Pagination support
- Action menus for each row
- Status indicators with color coding

### Settings Interface
- Tabbed navigation
- Form validation
- Toggle switches for preferences
- Password management with visibility controls

## Design System

The UI follows a consistent design system with:
- **Colors**: Blue primary (#3B82F6), with semantic colors for status
- **Typography**: Geist font family with consistent sizing
- **Spacing**: Tailwind's spacing scale for consistent layouts
- **Components**: Reusable components with consistent styling

## Development

- **Hot Reload**: Changes are reflected immediately during development
- **TypeScript**: Full type safety throughout the application
- **ESLint**: Code linting for consistency
- **Responsive**: Mobile-first responsive design

## Future Enhancements

- API integration for real data
- Authentication system implementation
- Advanced filtering and sorting
- Data export functionality
- Real-time notifications
- Dark mode support
