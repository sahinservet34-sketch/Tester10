import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Remove authentication dependencies - admin always accessible
  const isAuthenticated = false;
  const user = null;

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-primary/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/">
                <h1 className="text-2xl font-display font-bold text-accent tracking-tight cursor-pointer" data-testid="link-home">
                  SUPANO'S
                </h1>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-8">
              <Link href="/" className="text-foreground hover:text-accent transition-colors" data-testid="link-home-nav">
                Home
              </Link>
              <Link href="/menu" className="text-foreground hover:text-accent transition-colors" data-testid="link-menu-nav">
                Menu
              </Link>
              <Link href="/events" className="text-foreground hover:text-accent transition-colors" data-testid="link-events-nav">
                Events
              </Link>
              <Link href="/scores" className="text-foreground hover:text-accent transition-colors" data-testid="link-scores-nav">
                Scores
              </Link>
            </div>
            
            {/* CTA Button & Auth */}
            <div className="flex items-center space-x-4">
              <Link href="/reservations">
                <Button className="bg-accent text-accent-foreground px-6 py-2 rounded-xl font-semibold hover:bg-gold-600 transition-all duration-200 transform hover:scale-105" data-testid="button-reserve-nav">
                  Reserve a Table
                </Button>
              </Link>
              
              
              <button 
                className="md:hidden text-foreground"
                onClick={() => setIsMobileMenuOpen(true)}
                data-testid="button-mobile-menu"
              >
                <i className="fas fa-bars"></i>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-primary/95 backdrop-blur-sm z-50 md:hidden" data-testid="mobile-menu-overlay">
          <div className="flex flex-col items-center justify-center h-full space-y-8">
            <button
              className="absolute top-4 right-4 text-foreground"
              onClick={() => setIsMobileMenuOpen(false)}
              data-testid="button-close-mobile-menu"
            >
              <i className="fas fa-times text-2xl"></i>
            </button>
            
            <Link 
              href="/" 
              className="text-2xl font-display text-foreground hover:text-accent transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
              data-testid="link-home-mobile"
            >
              HOME
            </Link>
            <Link 
              href="/menu" 
              className="text-2xl font-display text-foreground hover:text-accent transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
              data-testid="link-menu-mobile"
            >
              MENU
            </Link>
            <Link 
              href="/events" 
              className="text-2xl font-display text-foreground hover:text-accent transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
              data-testid="link-events-mobile"
            >
              EVENTS
            </Link>
            <Link 
              href="/scores" 
              className="text-2xl font-display text-foreground hover:text-accent transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
              data-testid="link-scores-mobile"
            >
              SCORES
            </Link>
            
            <Link href="/reservations">
              <Button 
                className="bg-accent text-accent-foreground px-8 py-4 rounded-xl font-semibold text-lg"
                onClick={() => setIsMobileMenuOpen(false)}
                data-testid="button-reserve-mobile"
              >
                Reserve a Table
              </Button>
            </Link>
            
          </div>
        </div>
      )}
    </>
  );
}
