import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Facebook, Instagram, Twitter, Youtube, MapPin, Phone, Mail } from "lucide-react";

export default function Footer() {
  const { data: settingsArray } = useQuery({
    queryKey: ["/api/settings"],
  });

  // Convert settings array to object for easier access
  const settings = settingsArray?.reduce((acc: any, setting: any) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {});

  return (
    <footer className="bg-primary py-12 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-display font-bold text-accent mb-4 tracking-tight">SUPANO'S</h3>
            <p className="text-muted-foreground mb-4">
              Your ultimate sports bar destination for great food, drinks, and game day action.
            </p>
          </div>

          {/* Hours */}
          <div>
            <h4 className="text-lg font-semibold text-primary-foreground mb-4">Hours</h4>
            <div className="space-y-2 text-muted-foreground">
              <p>Mon-Thu: {settings?.hours?.monday || "11AM - 12AM"}</p>
              <p>Fri-Sat: {settings?.hours?.friday || "11AM - 2AM"}</p>
              <p>Sunday: {settings?.hours?.sunday || "10AM - 12AM"}</p>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold text-primary-foreground mb-4">Contact</h4>
            <div className="space-y-2 text-muted-foreground">
              <p className="flex items-center">
                <MapPin className="mr-2 h-4 w-4 text-accent" />
                {settings?.contact?.address || "123 Sports Ave, Game City"}
              </p>
              <p className="flex items-center">
                <Phone className="mr-2 h-4 w-4 text-accent" />
                {settings?.contact?.phone || "(555) 123-GAME"}
              </p>
              <p className="flex items-center">
                <Mail className="mr-2 h-4 w-4 text-accent" />
                {settings?.contact?.email || "info@supanos.bar"}
              </p>
            </div>
          </div>

          {/* Social & Navigation */}
          <div>
            <h4 className="text-lg font-semibold text-primary-foreground mb-4">Follow Us</h4>
            <div className="flex space-x-4 mb-6">
              {settings?.social?.facebook && (
                <a 
                  href={settings.social.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-accent transition-colors" 
                  data-testid="link-facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {settings?.social?.instagram && (
                <a 
                  href={settings.social.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-accent transition-colors" 
                  data-testid="link-instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {settings?.social?.twitter && (
                <a 
                  href={settings.social.twitter} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-accent transition-colors" 
                  data-testid="link-twitter"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              )}
              {settings?.social?.youtube && (
                <a 
                  href={settings.social.youtube} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-accent transition-colors" 
                  data-testid="link-youtube"
                >
                  <Youtube className="h-5 w-5" />
                </a>
              )}
            </div>
            <div className="space-y-2 text-sm">
              <Link href="/menu" className="text-muted-foreground hover:text-accent transition-colors block" data-testid="link-menu-footer">
                Menu
              </Link>
              <Link href="/events" className="text-muted-foreground hover:text-accent transition-colors block" data-testid="link-events-footer">
                Events
              </Link>
              <Link href="/reservations" className="text-muted-foreground hover:text-accent transition-colors block" data-testid="link-reservations-footer">
                Reservations
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
          <p>&copy; 2025 Supano's Sports Bar & Grill. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
