import { Link } from "wouter";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import ScoreTicker from "@/components/score-ticker";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <ScoreTicker />
      <Navbar />
      
      {/* Welcome Section */}
      <section className="bg-gradient-arena relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-display font-bold text-foreground mb-6 tracking-tight uppercase">
              Welcome Back to<br/>
              <span className="text-accent text-shadow-glow">Supano's</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Hello {user?.firstName || 'there'}! Ready for another great experience at your favorite sports bar?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/reservations">
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-gold-600 glow-gold text-lg px-8 py-4" data-testid="button-reserve-table">
                  Make a Reservation
                </Button>
              </Link>
              <Link href="/menu">
                <Button variant="outline" size="lg" className="border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground text-lg px-8 py-4" data-testid="button-browse-menu">
                  Browse Menu
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4 uppercase tracking-tight">
              What's Next?
            </h2>
            <p className="text-xl text-muted-foreground">Quick access to everything you need</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/menu">
              <Card className="card-shadow hover:transform hover:scale-105 transition-all duration-200 cursor-pointer" data-testid="card-menu">
                <CardContent className="p-6 text-center">
                  <div className="mb-4">
                    <i className="fas fa-utensils text-4xl text-accent"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-card-foreground mb-2">Menu</h3>
                  <p className="text-muted-foreground">Browse our game day favorites</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/events">
              <Card className="card-shadow hover:transform hover:scale-105 transition-all duration-200 cursor-pointer" data-testid="card-events">
                <CardContent className="p-6 text-center">
                  <div className="mb-4">
                    <i className="fas fa-calendar-check text-4xl text-accent"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-card-foreground mb-2">Events</h3>
                  <p className="text-muted-foreground">See what's happening</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/scores">
              <Card className="card-shadow hover:transform hover:scale-105 transition-all duration-200 cursor-pointer" data-testid="card-scores">
                <CardContent className="p-6 text-center">
                  <div className="mb-4">
                    <i className="fas fa-trophy text-4xl text-accent"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-card-foreground mb-2">Live Scores</h3>
                  <p className="text-muted-foreground">Stay updated with the action</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/reservations">
              <Card className="card-shadow hover:transform hover:scale-105 transition-all duration-200 cursor-pointer" data-testid="card-reservations">
                <CardContent className="p-6 text-center">
                  <div className="mb-4">
                    <i className="fas fa-clock text-4xl text-accent"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-card-foreground mb-2">Reservations</h3>
                  <p className="text-muted-foreground">Book your table</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Admin Access */}
      {user?.role === 'admin' && (
        <section className="py-16 bg-card border-t-4 border-accent">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-display font-bold text-card-foreground mb-4 uppercase tracking-tight">
              Admin Dashboard
            </h2>
            <p className="text-xl text-muted-foreground mb-8">Manage your sports bar efficiently</p>
            <Link href="/admin/dashboard">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-gold-600 text-lg px-8 py-4" data-testid="button-admin-dashboard">
                Go to Admin Dashboard
              </Button>
            </Link>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
