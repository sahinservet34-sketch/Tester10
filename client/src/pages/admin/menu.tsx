import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import AdminLayout from "@/components/admin-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const menuItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  categoryId: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  price: z.string().min(1, "Price is required"),
  imageUrl: z.string().optional(),
  tags: z.string().optional(),
  spicyLevel: z.number().min(0).max(5).optional(),
  isAvailable: z.boolean().default(true),
});

const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  description: z.string().optional(),
  order: z.number().min(0).default(0),
});

type MenuItemForm = z.infer<typeof menuItemSchema>;
type CategoryForm = z.infer<typeof categorySchema>;

export default function AdminMenu() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isMenuItemDialogOpen, setIsMenuItemDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  const { data: categories } = useQuery({
    queryKey: ["/api/menu/categories"],
  });

  const { data: menuItems } = useQuery({
    queryKey: ["/api/menu/items"],
  });

  const menuItemForm = useForm<MenuItemForm>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: "",
      categoryId: "",
      description: "",
      price: "",
      imageUrl: "",
      tags: "",
      spicyLevel: 0,
      isAvailable: true,
    },
  });

  const categoryForm = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      description: "",
      order: 0,
    },
  });

  // Category mutations
  const createCategory = useMutation({
    mutationFn: async (data: CategoryForm) => {
      return apiRequest("/api/menu/categories", "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "Category Created",
        description: "Category has been successfully created.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/menu/categories"] });
      setIsCategoryDialogOpen(false);
      setEditingCategory(null);
      categoryForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateCategory = useMutation({
    mutationFn: async (data: { id: string; updates: Partial<CategoryForm> }) => {
      return apiRequest(`/api/menu/categories/${data.id}`, "PATCH", data.updates);
    },
    onSuccess: () => {
      toast({
        title: "Category Updated",
        description: "Category has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/menu/categories"] });
      setIsCategoryDialogOpen(false);
      setEditingCategory(null);
      categoryForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/menu/categories/${id}`, "DELETE");
    },
    onSuccess: () => {
      toast({
        title: "Category Deleted",
        description: "Category has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/menu/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/menu/items"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Menu item mutations
  const createItem = useMutation({
    mutationFn: async (data: MenuItemForm) => {
      const formattedData = {
        ...data,
        price: data.price, // Keep as string - schema expects string
        tags: data.tags ? data.tags.split(",").map(tag => tag.trim()) : [],
      };
      return apiRequest("/api/menu/items", "POST", formattedData);
    },
    onSuccess: () => {
      toast({
        title: "Menu Item Created",
        description: "Menu item has been successfully created.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/menu/items"] });
      setIsMenuItemDialogOpen(false);
      menuItemForm.reset();
      setUploadedImageUrl(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/menu/items/${id}`, "DELETE");
    },
    onSuccess: () => {
      toast({
        title: "Menu Item Deleted",
        description: "Menu item has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/menu/items"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onMenuItemSubmit = (data: MenuItemForm) => {
    createItem.mutate(data);
  };

  const onCategorySubmit = (data: CategoryForm) => {
    if (editingCategory) {
      updateCategory.mutate({ id: editingCategory.id, updates: data });
    } else {
      createCategory.mutate(data);
    }
  };

  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    categoryForm.setValue("name", category.name);
    categoryForm.setValue("description", category.description || "");
    categoryForm.setValue("order", category.order || 0);
    setIsCategoryDialogOpen(true);
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    categoryForm.reset();
    setIsCategoryDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground uppercase">Menu Management</h1>
          <p className="text-muted-foreground">Manage your menu categories and items</p>
        </div>

        <Tabs defaultValue="items" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="items" data-testid="tab-menu-items">Menu Items</TabsTrigger>
            <TabsTrigger value="categories" data-testid="tab-categories">Categories</TabsTrigger>
          </TabsList>

          {/* Menu Items Tab */}
          <TabsContent value="items" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Menu Items</h2>
              <Dialog open={isMenuItemDialogOpen} onOpenChange={setIsMenuItemDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-accent text-accent-foreground hover:bg-gold-600" data-testid="button-add-menu-item">
                    Add Menu Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Menu Item</DialogTitle>
                  </DialogHeader>
                  <Form {...menuItemForm}>
                    <form onSubmit={menuItemForm.handleSubmit(onMenuItemSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={menuItemForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Buffalo Wings" {...field} data-testid="input-item-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={menuItemForm.control}
                          name="categoryId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-category">
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {Array.isArray(categories) && categories.map((category: any) => (
                                    <SelectItem key={category.id} value={category.id}>
                                      {category.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={menuItemForm.control}
                          name="price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Price</FormLabel>
                              <FormControl>
                                <Input placeholder="14.99" type="number" step="0.01" {...field} data-testid="input-item-price" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={menuItemForm.control}
                          name="spicyLevel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Spicy Level (0-5)</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="0" 
                                  type="number" 
                                  min="0" 
                                  max="5" 
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                  data-testid="input-spicy-level"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={menuItemForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Delicious buffalo wings served with celery and blue cheese dip" {...field} data-testid="textarea-description" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={menuItemForm.control}
                        name="tags"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tags (comma separated)</FormLabel>
                            <FormControl>
                              <Input placeholder="Spicy, Popular, House Special" {...field} data-testid="input-tags" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="space-y-4">
                        <Label>Menu Item Image</Label>
                        {uploadedImageUrl && (
                          <div className="space-y-2">
                            <img 
                              src={uploadedImageUrl} 
                              alt="Menu item preview" 
                              className="w-full h-32 object-cover rounded-md border"
                            />
                          </div>
                        )}
                        <div className="flex flex-col gap-2">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;

                              setUploading(true);
                              try {
                                const formData = new FormData();
                                formData.append('image', file);

                                const response = await fetch('/api/upload', {
                                  method: 'POST',
                                  body: formData,
                                });

                                if (!response.ok) throw new Error('Upload failed');

                                const { imageUrl } = await response.json();
                                setUploadedImageUrl(imageUrl);
                                menuItemForm.setValue('imageUrl', imageUrl);
                              } catch (error) {
                                toast({
                                  title: "Upload Failed",
                                  description: "Failed to upload menu item image",
                                  variant: "destructive",
                                });
                              } finally {
                                setUploading(false);
                              }
                            }}
                            disabled={uploading}
                            className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-accent file:text-accent-foreground"
                          />
                          {uploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
                        </div>
                        <FormField
                          control={menuItemForm.control}
                          name="imageUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Or Image URL</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="https://..." 
                                  {...field} 
                                  data-testid="input-image-url" 
                                  onChange={(e) => {
                                    field.onChange(e);
                                    setUploadedImageUrl(e.target.value);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-gold-600" data-testid="button-submit-menu-item">
                        Create Menu Item
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.isArray(menuItems) && menuItems.map((item: any) => (
                <Card key={item.id} className="card-shadow" data-testid={`menu-item-${item.id}`}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-lg text-foreground">{item.name}</h3>
                      <span className="text-lg font-bold text-accent">${item.price}</span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {Array.isArray(item.tags) && item.tags.map((tag: any, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">{item.category?.name}</span>
                      <Button 
                        onClick={() => deleteItem.mutate(item.id)}
                        variant="destructive"
                        size="sm"
                        data-testid={`button-delete-${item.id}`}
                      >
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {!Array.isArray(menuItems) || menuItems.length === 0 && (
                <p className="text-muted-foreground text-center py-8 col-span-full" data-testid="text-no-menu-items">No menu items yet</p>
              )}
            </div>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Categories</h2>
              <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={handleAddCategory} className="bg-accent text-accent-foreground hover:bg-gold-600" data-testid="button-add-category">
                    Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
                  </DialogHeader>
                  <Form {...categoryForm}>
                    <form onSubmit={categoryForm.handleSubmit(onCategorySubmit)} className="space-y-4">
                      <FormField
                        control={categoryForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Appetizers" {...field} data-testid="input-category-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={categoryForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Delicious starters to begin your meal" {...field} data-testid="textarea-category-description" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={categoryForm.control}
                        name="order"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Display Order</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="0" 
                                type="number" 
                                min="0"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                data-testid="input-category-order"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-gold-600" data-testid="button-submit-category">
                        {editingCategory ? "Update Category" : "Create Category"}
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.isArray(categories) && categories.map((category: any) => (
                <Card key={category.id} className="card-shadow" data-testid={`category-${category.id}`}>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <span>{category.name}</span>
                      <span className="text-sm text-muted-foreground">Order: {category.order}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{category.description}</p>
                    <div className="flex justify-between">
                      <Button 
                        onClick={() => handleEditCategory(category)}
                        variant="outline"
                        size="sm"
                        data-testid={`button-edit-category-${category.id}`}
                      >
                        Edit
                      </Button>
                      <Button 
                        onClick={() => deleteCategory.mutate(category.id)}
                        variant="destructive"
                        size="sm"
                        data-testid={`button-delete-category-${category.id}`}
                      >
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {!Array.isArray(categories) || categories.length === 0 && (
                <p className="text-muted-foreground text-center py-8 col-span-full" data-testid="text-no-categories">No categories yet</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}