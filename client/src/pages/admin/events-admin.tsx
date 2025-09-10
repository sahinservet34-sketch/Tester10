import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import AdminLayout from "@/components/admin-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  dateTime: z.string().min(1, "Date and time are required"),
  sportType: z.enum(["NFL", "MLB", "Custom"]),
  imageUrl: z.string().optional(),
  isFeatured: z.boolean().default(false),
});

type EventForm = z.infer<typeof eventSchema>;

export default function AdminEvents() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  const form = useForm<EventForm>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      dateTime: "",
      sportType: "Custom",
      imageUrl: "",
      isFeatured: false,
    },
  });

  const { data: events = [] } = useQuery({
    queryKey: ["/api/events"],
  });

  const createEvent = useMutation({
    mutationFn: async (data: EventForm) => {
      const formattedData = {
        ...data,
        dateTime: new Date(data.dateTime).toISOString(),
      };
      return apiRequest("/api/events", "POST", formattedData);
    },
    onSuccess: () => {
      toast({
        title: "Event Created",
        description: "Event has been successfully created.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      setIsDialogOpen(false);
      form.reset();
      setUploadedImageUrl(null);
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

  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/events/${id}`, "DELETE");
    },
    onSuccess: () => {
      toast({
        title: "Event Deleted",
        description: "Event has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
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

  const onSubmit = (data: EventForm) => {
    createEvent.mutate(data);
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground uppercase">Event Management</h1>
            <p className="text-muted-foreground">Manage your events and activities</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-accent text-accent-foreground hover:bg-gold-600" data-testid="button-add-event">
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Event</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Sunday Night Football" {...field} data-testid="input-event-title" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Watch the game on our massive screens with drink specials" {...field} data-testid="textarea-event-description" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="dateTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date & Time</FormLabel>
                          <FormControl>
                            <Input type="datetime-local" {...field} data-testid="input-event-datetime" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="sportType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sport Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-sport-type">
                                <SelectValue placeholder="Select sport type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="NFL">NFL</SelectItem>
                              <SelectItem value="MLB">MLB</SelectItem>
                              <SelectItem value="Custom">Custom</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <Label>Event Image</Label>
                    {uploadedImageUrl && (
                      <div className="space-y-2">
                        <img 
                          src={uploadedImageUrl} 
                          alt="Event preview" 
                          className="w-full h-32 object-cover rounded-md border"
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-4">
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
                              form.setValue('imageUrl', imageUrl);
                            } catch (error) {
                              toast({
                                title: "Upload Failed",
                                description: "Failed to upload event image",
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
                    </div>
                    <FormField
                      control={form.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Or Image URL</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="https://..." 
                              {...field} 
                              data-testid="input-event-image" 
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

                  <FormField
                    control={form.control}
                    name="isFeatured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Featured Event</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Display this event prominently on the homepage
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-featured"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full bg-accent text-accent-foreground hover:bg-gold-600"
                    disabled={createEvent.isPending}
                    data-testid="button-save-event"
                  >
                    {createEvent.isPending ? "Creating..." : "Create Event"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event: any) => (
            <Card key={event.id} className="card-shadow" data-testid={`card-event-${event.id}`}>
              <CardContent className="p-6">
                {event.imageUrl && (
                  <img src={event.imageUrl} alt={event.title} className="w-full h-32 object-cover rounded-lg mb-4" />
                )}
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={event.sportType === "NFL" ? "default" : event.sportType === "MLB" ? "secondary" : "outline"}>
                    {event.sportType}
                  </Badge>
                  {event.isFeatured && (
                    <Badge variant="destructive">Featured</Badge>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-card-foreground mb-2">{event.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {new Date(event.dateTime).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground mb-4">{event.description}</p>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteEvent.mutate(event.id)}
                  disabled={deleteEvent.isPending}
                  data-testid={`button-delete-event-${event.id}`}
                >
                  Delete
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {!events.length && (
          <div className="text-center py-12" data-testid="text-no-events">
            <p className="text-xl text-muted-foreground">No events found</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
