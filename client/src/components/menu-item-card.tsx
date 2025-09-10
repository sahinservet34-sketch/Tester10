import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface MenuItemCardProps {
  item: {
    id: string;
    name: string;
    description?: string;
    price: string;
    imageUrl?: string;
    tags?: string[];
    spicyLevel?: number;
    isAvailable: boolean;
    category?: {
      name: string;
    };
  };
}

export default function MenuItemCard({ item }: MenuItemCardProps) {
  const getDefaultImage = () => {
    // Return a default image based on category or item name
    if (item.category?.name.toLowerCase().includes('wing')) {
      return "https://images.unsplash.com/photo-1527477396000-e27163b481c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600";
    }
    if (item.category?.name.toLowerCase().includes('burger')) {
      return "https://images.unsplash.com/photo-1571091718767-18b5b1457add?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600";
    }
    if (item.category?.name.toLowerCase().includes('drink') || item.category?.name.toLowerCase().includes('beer')) {
      return "https://images.unsplash.com/photo-1618885472179-5e474019f2a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600";
    }
    return "https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600";
  };

  return (
    <Card className="bg-card rounded-2xl overflow-hidden card-shadow hover:transform hover:scale-105 transition-all duration-200" data-testid={`card-menu-item-${item.id}`}>
      <img 
        src={item.imageUrl || getDefaultImage()} 
        alt={item.name} 
        className="w-full h-48 object-cover"
        onError={(e) => {
          (e.target as HTMLImageElement).src = getDefaultImage();
        }}
      />
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-semibold text-card-foreground" data-testid={`text-item-name-${item.id}`}>
            {item.name}
          </h3>
          <span className="text-2xl font-numeric font-bold text-accent" data-testid={`text-item-price-${item.id}`}>
            ${item.price}
          </span>
        </div>
        
        {item.description && (
          <p className="text-muted-foreground mb-4" data-testid={`text-item-description-${item.id}`}>
            {item.description}
          </p>
        )}
        
        <div className="flex gap-2 mb-4">
          {item.spicyLevel && item.spicyLevel > 0 && (
            <Badge variant="destructive" data-testid={`badge-spicy-${item.id}`}>
              Spicy
            </Badge>
          )}
          {item.tags?.map((tag) => (
            <Badge key={tag} variant="secondary" data-testid={`badge-tag-${tag.toLowerCase()}-${item.id}`}>
              {tag}
            </Badge>
          ))}
          {!item.isAvailable && (
            <Badge variant="outline" data-testid={`badge-unavailable-${item.id}`}>
              Unavailable
            </Badge>
          )}
        </div>
        
        <Button 
          className="w-full bg-accent text-accent-foreground py-3 rounded-xl font-semibold hover:bg-gold-600 transition-colors"
          disabled={!item.isAvailable}
          data-testid={`button-add-to-order-${item.id}`}
        >
          {item.isAvailable ? "Add to Order" : "Currently Unavailable"}
        </Button>
      </CardContent>
    </Card>
  );
}
