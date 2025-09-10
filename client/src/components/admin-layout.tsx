import { ReactNode } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  // Remove authentication dependency
  const user = null;

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="bg-primary border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/admin/dashboard">
                <h1 className="text-2xl font-display font-bold text-accent tracking-tight cursor-pointer" data-testid="link-admin-home">
                  SUPANO'S ADMIN
                </h1>
              </Link>
              
              <nav className="hidden md:flex space-x-6">
                <Link href="/admin/dashboard">
                  <span className="text-foreground hover:text-accent transition-colors text-sm cursor-pointer" data-testid="link-dashboard">
                    Dashboard
                  </span>
                </Link>
                <Link href="/admin/menu">
                  <span className="text-foreground hover:text-accent transition-colors text-sm cursor-pointer" data-testid="link-menu-admin">
                    Menu
                  </span>
                </Link>
                <Link href="/admin/events">
                  <span className="text-foreground hover:text-accent transition-colors text-sm cursor-pointer" data-testid="link-events-admin">
                    Events
                  </span>
                </Link>
                <Link href="/admin/reservations">
                  <span className="text-foreground hover:text-accent transition-colors text-sm cursor-pointer" data-testid="link-reservations-admin">
                    Reservations
                  </span>
                </Link>
                <Link href="/admin/users">
                  <span className="text-foreground hover:text-accent transition-colors text-sm cursor-pointer" data-testid="link-users-admin">
                    Users
                  </span>
                </Link>
                <Link href="/admin/settings">
                  <span className="text-foreground hover:text-accent transition-colors text-sm cursor-pointer" data-testid="link-settings-admin">
                    Settings
                  </span>
                </Link>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm" data-testid="button-view-site">
                  View Site
                </Button>
              </Link>
              
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block text-sm">
                  <p className="text-foreground font-medium">Admin</p>
                  <p className="text-muted-foreground text-xs">Administrator</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-4 py-3 overflow-x-auto scrollbar-hide">
            <Link href="/admin/dashboard">
              <span className="text-foreground hover:text-accent transition-colors text-sm whitespace-nowrap cursor-pointer" data-testid="link-dashboard-mobile">
                Dashboard
              </span>
            </Link>
            <Link href="/admin/menu">
              <span className="text-foreground hover:text-accent transition-colors text-sm whitespace-nowrap cursor-pointer" data-testid="link-menu-mobile">
                Menu
              </span>
            </Link>
            <Link href="/admin/events">
              <span className="text-foreground hover:text-accent transition-colors text-sm whitespace-nowrap cursor-pointer" data-testid="link-events-mobile">
                Events
              </span>
            </Link>
            <Link href="/admin/reservations">
              <span className="text-foreground hover:text-accent transition-colors text-sm whitespace-nowrap cursor-pointer" data-testid="link-reservations-mobile">
                Reservations
              </span>
            </Link>
            <Link href="/admin/users">
              <span className="text-foreground hover:text-accent transition-colors text-sm whitespace-nowrap cursor-pointer" data-testid="link-users-mobile">
                Users
              </span>
            </Link>
            <Link href="/admin/settings">
              <span className="text-foreground hover:text-accent transition-colors text-sm whitespace-nowrap cursor-pointer" data-testid="link-settings-mobile">
                Settings
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
