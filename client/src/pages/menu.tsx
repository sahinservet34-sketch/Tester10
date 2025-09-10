import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import ScoreTicker from "@/components/score-ticker";
import MenuItemCard from "@/components/menu-item-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Menu() {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: categories } = useQuery({
    queryKey: ["/api/menu/categories"],
  });

  const { data: menuItems } = useQuery({
    queryKey: ["/api/menu/items", selectedCategory, searchTerm],
    queryFn: () => {
      const params = new URLSearchParams();
      if (selectedCategory) params.append("categoryId", selectedCategory);
      if (searchTerm) params.append("search", searchTerm);
      return fetch(`/api/menu/items?${params}`).then(res => res.json());
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <ScoreTicker />
      <Navbar />
      
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4 uppercase tracking-tight">
              Our Menu
            </h1>
            <p className="text-xl text-muted-foreground">Game day favorites and craft selections</p>
          </div>

          {/* Search */}
          <div className="mb-8 max-w-md mx-auto">
            <Input
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
              data-testid="input-search-menu"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-12 overflow-x-auto scrollbar-hide">
            <Button
              variant={selectedCategory === "" ? "default" : "outline"}
              className={selectedCategory === "" ? "bg-accent text-accent-foreground" : ""}
              onClick={() => setSelectedCategory("")}
              data-testid="button-category-all"
            >
              All Items
            </Button>
            {categories?.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                className={selectedCategory === category.id ? "bg-accent text-accent-foreground" : ""}
                onClick={() => setSelectedCategory(category.id)}
                data-testid={`button-category-${category.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {category.name}
              </Button>
            ))}
          </div>

          {/* Menu Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {menuItems?.map((item) => (
              <MenuItemCard key={item.id} item={item} />
            ))}
          </div>

          {!menuItems?.length && (
            <div className="text-center py-12" data-testid="text-no-items">
              <p className="text-xl text-muted-foreground">No menu items found</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
