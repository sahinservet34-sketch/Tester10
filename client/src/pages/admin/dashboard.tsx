import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import AdminLayout from "@/components/admin-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const { data: reservations } = useQuery({
    queryKey: ["/api/reservations"],
  });

  const { data: menuItems } = useQuery({
    queryKey: ["/api/menu/items"],
  });

  const { data: events } = useQuery({
    queryKey: ["/api/events"],
  });

  const todayReservations = Array.isArray(reservations) ? reservations.filter((r: any) => 
    new Date(r.dateTime).toDateString() === new Date().toDateString()
  ).length : 0;

  const recentReservations = Array.isArray(reservations) ? reservations.slice(0, 3) : [];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground uppercase">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to the admin dashboard!</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="card-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today's Reservations</p>
                  <p className="text-3xl font-numeric font-bold text-accent" data-testid="stat-today-reservations">{todayReservations}</p>
                </div>
                <i className="fas fa-calendar-check text-2xl text-accent"></i>
              </div>
            </CardContent>
          </Card>

          <Card className="card-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Menu Items</p>
                  <p className="text-3xl font-numeric font-bold text-success" data-testid="stat-menu-items">{Array.isArray(menuItems) ? menuItems.length : 0}</p>
                </div>
                <i className="fas fa-utensils text-2xl text-success"></i>
              </div>
            </CardContent>
          </Card>

          <Card className="card-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Events</p>
                  <p className="text-3xl font-numeric font-bold text-warning" data-testid="stat-active-events">{Array.isArray(events) ? events.length : 0}</p>
                </div>
                <i className="fas fa-star text-2xl text-warning"></i>
              </div>
            </CardContent>
          </Card>

          <Card className="card-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Reservations</p>
                  <p className="text-3xl font-numeric font-bold text-accent" data-testid="stat-total-reservations">{Array.isArray(reservations) ? reservations.length : 0}</p>
                </div>
                <i className="fas fa-clipboard-list text-2xl text-accent"></i>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Reservations */}
          <div className="lg:col-span-2">
            <Card className="card-shadow">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-card-foreground mb-4">Recent Reservations</h3>
                <div className="space-y-4">
                  {recentReservations.map((reservation) => (
                    <div key={reservation.id} className="flex justify-between items-center p-4 bg-background rounded-lg" data-testid={`reservation-${reservation.id}`}>
                      <div>
                        <p className="font-semibold text-foreground">{reservation.fullName}</p>
                        <p className="text-sm text-muted-foreground">
                          {reservation.people} people • {new Date(reservation.dateTime).toLocaleString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        reservation.status === 'confirmed' ? 'bg-success/20 text-success' :
                        reservation.status === 'pending' ? 'bg-warning/20 text-warning' :
                        'bg-danger/20 text-danger'
                      }`}>
                        {reservation.status}
                      </span>
                    </div>
                  ))}
                  {!recentReservations.length && (
                    <p className="text-muted-foreground text-center py-8" data-testid="text-no-reservations">No reservations yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <Card className="card-shadow">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-card-foreground mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link href="/admin/menu">
                    <Button className="w-full bg-accent text-accent-foreground hover:bg-gold-600" data-testid="button-manage-menu">
                      Manage Menu
                    </Button>
                  </Link>
                  <Link href="/admin/events">
                    <Button className="w-full bg-primary text-primary-foreground hover:bg-brand-400" data-testid="button-manage-events">
                      Manage Events
                    </Button>
                  </Link>
                  <Link href="/admin/reservations">
                    <Button className="w-full bg-secondary text-secondary-foreground hover:bg-brand-300" data-testid="button-manage-reservations">
                      Manage Reservations
                    </Button>
                  </Link>
                  <Link href="/admin/settings">
                    <Button className="w-full bg-success text-background hover:opacity-90" data-testid="button-manage-settings">
                      Settings
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
