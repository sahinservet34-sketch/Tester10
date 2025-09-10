import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import AdminLayout from "@/components/admin-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Upload, Image as ImageIcon } from "lucide-react";

const settingsSchema = z.object({
  hours: z.object({
    monday: z.string(),
    tuesday: z.string(),
    wednesday: z.string(),
    thursday: z.string(),
    friday: z.string(),
    saturday: z.string(),
    sunday: z.string(),
  }),
  contact: z.object({
    address: z.string(),
    phone: z.string(),
    email: z.string(),
  }),
  hero: z.object({
    title: z.string(),
    subtitle: z.string(),
  }),
  social: z.object({
    facebook: z.string().optional(),
    instagram: z.string().optional(),
    twitter: z.string().optional(),
    youtube: z.string().optional(),
  }),
});

type SettingsForm = z.infer<typeof settingsSchema>;

function HeroImageUpload() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [currentHeroImage, setCurrentHeroImage] = useState<string | null>(null);

  const { data: settings } = useQuery({
    queryKey: ["/api/settings"],
    select: (data) => {
      const heroImageSetting = data?.find((s: any) => s.key === 'heroImage');
      return heroImageSetting?.value || null;
    }
  });

  const updateHeroImage = useMutation({
    mutationFn: async (imageUrl: string) => {
      return apiRequest("/api/settings", "POST", { 
        key: "heroImage", 
        value: imageUrl 
      });
    },
    onSuccess: () => {
      toast({
        title: "Hero Image Updated",
        description: "Hero background image has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update hero image",
        variant: "destructive",
      });
    },
  });

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const { imageUrl } = await response.json();
      setCurrentHeroImage(imageUrl);
      updateHeroImage.mutate(imageUrl);
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload hero image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="card-shadow">
      <CardHeader>
        <CardTitle className="text-xl font-display uppercase">Hero Background Image</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {(settings || currentHeroImage) && (
          <div className="space-y-2">
            <Label>Current Hero Image</Label>
            <div className="relative">
              <img 
                src={currentHeroImage || settings} 
                alt="Current hero background" 
                className="w-full h-32 object-cover rounded-md border"
              />
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="hero-image">Upload New Hero Image</Label>
          <div className="flex items-center gap-4">
            <Input
              id="hero-image"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-accent file:text-accent-foreground"
            />
            <Button
              type="button"
              variant="outline"
              disabled={uploading}
              className="flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <Upload className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <ImageIcon className="w-4 h-4" />
                  Upload Image
                </>
              )}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Recommended size: 1920x1080px. Supported formats: JPG, PNG, WebP
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings } = useQuery({
    queryKey: ["/api/settings"],
  });

  const form = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      hours: {
        monday: "11AM - 12AM",
        tuesday: "11AM - 12AM",
        wednesday: "11AM - 12AM",
        thursday: "11AM - 12AM",
        friday: "11AM - 2AM",
        saturday: "11AM - 2AM",
        sunday: "10AM - 12AM",
      },
      contact: {
        address: "123 Sports Ave, Game City",
        phone: "(555) 123-GAME",
        email: "info@supanos.bar",
      },
      hero: {
        title: "Game On at Supano's",
        subtitle: "The ultimate sports bar experience with live games, craft drinks, and mouth-watering food.",
      },
      social: {
        facebook: "",
        instagram: "",
        twitter: "",
        youtube: "",
      },
    },
  });

  const updateSetting = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      return apiRequest("/api/settings", "POST", { key, value });
    },
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "Settings have been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SettingsForm) => {
    // Save each section separately
    updateSetting.mutate({ key: "hours", value: data.hours });
    updateSetting.mutate({ key: "contact", value: data.contact });
    updateSetting.mutate({ key: "hero", value: data.hero });
    updateSetting.mutate({ key: "social", value: data.social });
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground uppercase">Settings</h1>
          <p className="text-muted-foreground">Manage your restaurant settings</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Business Hours */}
            <Card className="card-shadow">
              <CardHeader>
                <CardTitle className="text-xl font-medium uppercase">Business Hours</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(form.getValues().hours).map(([day, hours]) => (
                    <FormField
                      key={day}
                      control={form.control}
                      name={`hours.${day}` as any}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="capitalize">{day}</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid={`input-hours-${day}`} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="card-shadow">
              <CardHeader>
                <CardTitle className="text-xl font-medium uppercase">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="contact.address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-address" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contact.phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contact.email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} data-testid="input-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Hero Section */}
            <Card className="card-shadow">
              <CardHeader>
                <CardTitle className="text-xl font-medium uppercase">Hero Section</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="hero.title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-hero-title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="hero.subtitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subtitle</FormLabel>
                      <FormControl>
                        <Textarea {...field} data-testid="textarea-hero-subtitle" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Hero Background Image */}
            <HeroImageUpload />

            {/* Social Media */}
            <Card className="card-shadow">
              <CardHeader>
                <CardTitle className="text-xl font-medium uppercase">Social Media</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="social.facebook"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Facebook URL</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://facebook.com/supanos" data-testid="input-facebook" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="social.instagram"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instagram URL</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://instagram.com/supanos" data-testid="input-instagram" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="social.twitter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Twitter URL</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://twitter.com/supanos" data-testid="input-twitter" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="social.youtube"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>YouTube URL</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://youtube.com/supanos" data-testid="input-youtube" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Button 
              type="submit" 
              className="w-full bg-accent text-accent-foreground hover:bg-gold-600 glow-gold text-lg py-4"
              disabled={updateSetting.isPending}
              data-testid="button-save-settings"
            >
              {updateSetting.isPending ? "Saving..." : "Save Settings"}
            </Button>
          </form>
        </Form>
      </div>
    </AdminLayout>
  );
}
