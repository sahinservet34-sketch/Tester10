# Supano's Sports Bar Web Application

## Overview

This project is a full-stack web application for "Supano's," a sports bar that combines food service, event management, and live sports viewing. The application serves as both a customer-facing platform and an administrative dashboard, featuring menu browsing, event listings, live sports scores, reservation systems, and comprehensive admin tools for content management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client application is built using React 18 with Vite as the build tool and bundler. The application follows a component-based architecture with:

- **UI Framework**: Uses shadcn/ui components built on Radix UI primitives for consistent, accessible interfaces
- **Styling**: TailwindCSS with custom CSS variables for theming, supporting a dark sports bar aesthetic
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Form Handling**: React Hook Form with Zod validation for type-safe form processing
- **TypeScript**: Full TypeScript implementation for type safety across the application

### Backend Architecture
The server follows a traditional Express.js REST API pattern:

- **Framework**: Express.js with TypeScript for the API layer
- **Database ORM**: Drizzle ORM with PostgreSQL as the primary database
- **Authentication**: OpenID Connect integration with Replit's authentication system
- **Session Management**: Express sessions with PostgreSQL storage using connect-pg-simple
- **Validation**: Zod schemas for request/response validation and type safety
- **File Structure**: Modular approach with separate files for routes, storage operations, and database configuration

### Data Storage Solutions
The application uses a PostgreSQL database with the following key design decisions:

- **ORM Choice**: Drizzle ORM chosen for its TypeScript-first approach and performance
- **Connection**: Neon serverless PostgreSQL for cloud deployment
- **Schema Management**: Migration-based schema management with automatic migration running
- **Session Storage**: Database-backed sessions for authentication persistence

### Database Schema
The schema includes core entities for a sports bar operation:
- Users (with role-based access: admin/staff/user)
- Menu categories and items with pricing and availability
- Events with sport type categorization (NFL/MLB/Custom)
- Reservations with status tracking
- Settings for site-wide configuration
- Upload management for media files
- Audit logging for administrative actions

### Authentication and Authorization
The system implements a role-based authentication system:

- **OpenID Connect**: Integration with Replit's authentication for secure user management
- **Session Management**: Secure HTTP-only cookies with configurable TTL
- **Role-Based Access**: Three-tier system (admin/staff/user) with route-level protection
- **Authorization Middleware**: Express middleware for protecting admin routes

### API Design
RESTful API design with consistent patterns:

- **CRUD Operations**: Standard HTTP methods for resource management
- **Error Handling**: Centralized error handling with proper HTTP status codes
- **Validation**: Request/response validation using Zod schemas
- **Logging**: Request logging with response time tracking for API endpoints

### Client-Server Communication
The frontend communicates with the backend through:

- **Query Client**: TanStack Query for efficient data fetching and caching
- **HTTP Client**: Custom fetch wrapper with credential handling and error management
- **Real-time Features**: Periodic polling for live scores (30-second intervals)
- **Form Submissions**: Mutation-based form handling with optimistic updates

## External Dependencies

### Core Framework Dependencies
- **React 18**: Frontend framework for component-based UI development
- **Express.js**: Backend web framework for API development
- **Vite**: Modern build tool and development server
- **TypeScript**: Type safety across the entire application stack

### Database and ORM
- **PostgreSQL**: Primary database system
- **Drizzle ORM**: TypeScript-first ORM for database operations
- **@neondatabase/serverless**: Serverless PostgreSQL driver for cloud deployment

### UI and Styling
- **shadcn/ui**: Pre-built component library based on Radix UI
- **Radix UI**: Headless UI primitives for accessibility
- **TailwindCSS**: Utility-first CSS framework
- **Lucide React**: Icon library for consistent iconography

### State Management and Data Fetching
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form state management and validation
- **Zod**: Schema validation for type safety

### Authentication and Session Management
- **OpenID Client**: OpenID Connect implementation for authentication
- **Passport.js**: Authentication middleware
- **connect-pg-simple**: PostgreSQL session store for Express

### Development and Build Tools
- **ESBuild**: Fast JavaScript bundler for production builds
- **TSX**: TypeScript execution for development
- **PostCSS**: CSS processing with Autoprefixer

### Additional Utilities
- **date-fns**: Date manipulation and formatting
- **clsx**: Conditional CSS class names
- **class-variance-authority**: Component variant management
- **nanoid**: Unique ID generation