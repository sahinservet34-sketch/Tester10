import { Link } from "wouter";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import ScoreTicker from "@/components/score-ticker";
import MenuItemCard from "@/components/menu-item-card";
import EventCard from "@/components/event-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useQuery } from "@tanstack/react-query";
import defaultHeroImage from "@assets/image_1757479212221.png";

export default function Landing() {
  const { data: menuItems } = useQuery({
    queryKey: ["/api/menu/items"],
  });

  const { data: events } = useQuery({
    queryKey: ["/api/events"],
  });

  const { data: settings } = useQuery({
    queryKey: ["/api/settings"],
  });

  const featuredMenuItems = Array.isArray(menuItems) ? menuItems.slice(0, 3) : [];
  const featuredEvents = Array.isArray(events) ? events.slice(0, 4) : [];
  
  // Get hero image from settings or use default
  const heroImageSetting = Array.isArray(settings) ? 
    settings.find((s: any) => s.key === 'heroImage') : null;
  const heroImage = heroImageSetting?.value || defaultHeroImage;

  return (
    <div className="min-h-screen bg-background">
      <ScoreTicker />
      <Navbar />
      
      {/* Hero Section */}
      <section 
        className="relative overflow-hidden bg-cover bg-center bg-no-repeat min-h-[70vh]"
        style={{
          backgroundImage: heroImage ? `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url(${heroImage})` : `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url(${defaultHeroImage})`
        }}
      >
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex items-center justify-center min-h-[70vh]">
          <div className="text-center w-full">
            <p className="text-2xl md:text-3xl text-gray-200 mb-8 max-w-2xl mx-auto font-medium">
              The ultimate sports bar experience with live games, craft drinks, and mouth-watering food. 
              Where every game matters and every meal is memorable.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/reservations">
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-gold-600 glow-gold text-lg px-8 py-4" data-testid="button-reserve-hero">
                  Reserve Your Table
                </Button>
              </Link>
              <Link href="/menu">
                <Button variant="outline" size="lg" className="border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground text-lg px-8 py-4" data-testid="button-menu-hero">
                  View Menu
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4 uppercase tracking-tight">
              Our Menu
            </h2>
            <p className="text-xl text-muted-foreground">Game day favorites and craft selections</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredMenuItems.map((item: any) => (
              <MenuItemCard key={item.id} item={item} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/menu">
              <Button className="bg-primary text-primary-foreground hover:bg-brand-400 text-lg px-8 py-4" data-testid="button-view-full-menu">
                View Full Menu
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-card-foreground mb-4 uppercase tracking-tight">
              Upcoming Events
            </h2>
            <p className="text-xl text-muted-foreground">Don't miss the action</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredEvents.map((event: any) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      </section>

      {/* Reservation Section */}
      <section className="py-16 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4 uppercase tracking-tight">
              Reserve Your Table
            </h2>
            <p className="text-xl text-muted-foreground">Secure your spot for the big game</p>
          </div>

          <Card className="card-shadow">
            <CardContent className="p-8">
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" placeholder="John Doe" data-testid="input-full-name" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="john@example.com" data-testid="input-email" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" type="tel" placeholder="(555) 123-4567" data-testid="input-phone" />
                  </div>
                  <div>
                    <Label htmlFor="people">Party Size</Label>
                    <Select>
                      <SelectTrigger data-testid="select-party-size">
                        <SelectValue placeholder="Select party size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2 People</SelectItem>
                        <SelectItem value="3">3 People</SelectItem>
                        <SelectItem value="4">4 People</SelectItem>
                        <SelectItem value="5">5 People</SelectItem>
                        <SelectItem value="6">6+ People</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" type="date" data-testid="input-date" />
                  </div>
                  <div>
                    <Label htmlFor="time">Time</Label>
                    <Select>
                      <SelectTrigger data-testid="select-time">
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="17:00">5:00 PM</SelectItem>
                        <SelectItem value="17:30">5:30 PM</SelectItem>
                        <SelectItem value="18:00">6:00 PM</SelectItem>
                        <SelectItem value="18:30">6:30 PM</SelectItem>
                        <SelectItem value="19:00">7:00 PM</SelectItem>
                        <SelectItem value="19:30">7:30 PM</SelectItem>
                        <SelectItem value="20:00">8:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Special Requests</Label>
                  <Textarea id="notes" placeholder="Any special requests or notes..." rows={3} data-testid="textarea-notes" />
                </div>

                <Link href="/reservations">
                  <Button type="button" className="w-full bg-accent text-accent-foreground hover:bg-gold-600 glow-gold text-lg py-4" data-testid="button-confirm-reservation">
                    Confirm Reservation
                  </Button>
                </Link>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
