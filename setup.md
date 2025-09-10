# Overview

This is a comprehensive small business management system called "Nexus" built as a full-stack web application. The system provides an integrated platform for managing point-of-sale operations, inventory, customers, vendors, sales orders, purchase orders, accounting, and AI-powered business insights. It features a modern React frontend with a Node.js/Express backend, PostgreSQL database with Drizzle ORM, and includes subscription-based feature access with Stripe integration.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Framework**: Radix UI components with shadcn/ui design system and Tailwind CSS for styling
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation schemas
- **Authentication**: Session-based authentication with context providers
- **Real-time Updates**: WebSocket integration for live notifications and updates

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Authentication**: Passport.js with local strategy and express-session
- **Password Security**: bcrypt for password hashing
- **Real-time Communication**: WebSocket server for live updates
- **API Design**: RESTful API with JSON responses

## Database Design
- **Primary Database**: PostgreSQL with Neon serverless hosting
- **Schema Management**: Drizzle migrations for version control
- **Core Entities**: Users, customers, vendors, products, sales orders, purchase orders, payments, AI insights, and notifications
- **Relationships**: Properly normalized schema with foreign key relationships between orders, items, customers, and vendors
- **Session Storage**: Database-backed session storage using connect-pg-simple

## Authentication & Authorization
- **Session Management**: Express sessions with PostgreSQL storage
- **Password Security**: bcrypt hashing with salt rounds
- **Role-Based Access**: User roles (admin, manager, sales, vendor, cashier) with different permission levels
- **Subscription Tiers**: Standard and Premium tiers controlling feature access
- **Route Protection**: Authentication guards on both frontend routes and backend API endpoints

## Feature Subscription System
- **Standard Tier**: Basic POS, inventory management, customer management, sales orders, basic reports, and accounting
- **Premium Tier**: All standard features plus AI insights, vendor management, purchase orders, advanced analytics, and reporting
- **Subscription Guards**: Frontend components that restrict access to premium features
- **Upgrade Flow**: Integrated Stripe checkout for subscription upgrades

# External Dependencies

## Payment Processing
- **Stripe**: Complete payment processing with subscription management
- **Integration**: Both server-side (Node.js SDK) and client-side (React components) Stripe integration
- **Features**: Subscription billing, payment methods, customer management

## Database Hosting
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Connection**: WebSocket-compatible connection handling for serverless environments

## AI/ML Services
- **OpenAI GPT-5**: Business insights generation, sales analysis, and inventory predictions
- **Use Cases**: Automated business recommendations, trend analysis, and predictive analytics for inventory management

## Development Tools
- **Vite**: Frontend build tool with hot module replacement
- **TypeScript**: Full-stack type safety with shared schemas
- **Drizzle Kit**: Database migrations and schema management
- **React DevTools**: Development debugging and optimization

## UI/UX Components
- **Radix UI**: Accessible, unstyled component primitives
- **Recharts**: Data visualization and charting library
- **Lucide Icons**: Consistent icon system throughout the application
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens

## Real-time Features
- **WebSocket (ws)**: Native WebSocket implementation for real-time updates
- **Use Cases**: Live inventory updates, order notifications, low stock alerts, and system notifications