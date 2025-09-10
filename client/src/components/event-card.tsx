import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description?: string;
    dateTime: string;
    sportType: "NFL" | "MLB" | "Custom";
    imageUrl?: string;
    isFeatured: boolean;
  };
}

export default function EventCard({ event }: EventCardProps) {
  const getDefaultImage = () => {
    switch (event.sportType) {
      case "NFL":
        return "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600";
      case "MLB":
        return "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600";
      default:
        return "https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600";
    }
  };

  const getBadgeVariant = (sportType: string) => {
    switch (sportType) {
      case "NFL":
        return "default";
      case "MLB":
        return "secondary";
      default:
        return "outline";
    }
  };

  const eventDate = new Date(event.dateTime);
  const dayOfWeek = eventDate.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  const timeString = eventDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const dateString = eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <Card className="bg-background rounded-2xl overflow-hidden card-shadow hover:transform hover:scale-105 transition-all duration-200" data-testid={`card-event-${event.id}`}>
      <img 
        src={event.imageUrl || getDefaultImage()} 
        alt={event.title} 
        className="w-full h-32 object-cover"
        onError={(e) => {
          (e.target as HTMLImageElement).src = getDefaultImage();
        }}
      />
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Badge className="bg-accent text-accent-foreground" data-testid={`badge-day-${event.id}`}>
            {dayOfWeek}
          </Badge>
          <Badge variant={getBadgeVariant(event.sportType)} data-testid={`badge-sport-${event.id}`}>
            {event.sportType}
          </Badge>
          {event.isFeatured && (
            <Badge variant="destructive" data-testid={`badge-featured-${event.id}`}>
              Featured
            </Badge>
          )}
        </div>
        
        <h3 className="text-lg font-semibold text-foreground mb-2" data-testid={`text-event-title-${event.id}`}>
          {event.title}
        </h3>
        
        <p className="text-sm text-muted-foreground mb-3" data-testid={`text-event-datetime-${event.id}`}>
          {timeString} • {dateString}
        </p>
        
        {event.description && (
          <p className="text-sm text-muted-foreground" data-testid={`text-event-description-${event.id}`}>
            {event.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
