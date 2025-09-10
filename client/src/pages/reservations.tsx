import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import ScoreTicker from "@/components/score-ticker";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const reservationSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone number is required"),
  dateTime: z.string().min(1, "Date and time are required"),
  people: z.number().min(1, "Party size is required"),
  notes: z.string().optional(),
});

type ReservationForm = z.infer<typeof reservationSchema>;

export default function Reservations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<ReservationForm>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      dateTime: "",
      people: 2,
      notes: "",
    },
  });

  const reservation = useMutation({
    mutationFn: async (data: ReservationForm) => {
      const dateTime = new Date(data.dateTime).toISOString();
      return apiRequest("/api/reservations", "POST", { ...data, dateTime });
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: "Reservation Confirmed!",
        description: "We'll send you a confirmation email shortly.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/reservations"] });
    },
    onError: (error) => {
      toast({
        title: "Reservation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ReservationForm) => {
    reservation.mutate(data);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <ScoreTicker />
        <Navbar />
        
        <section className="py-16 bg-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="card-shadow">
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <i className="fas fa-check-circle text-6xl text-success"></i>
                </div>
                <h1 className="text-4xl font-display font-bold text-foreground mb-4 uppercase">
                  Reservation Confirmed!
                </h1>
                <p className="text-xl text-muted-foreground mb-8">
                  Thank you for choosing Supano's! We'll send you a confirmation email with all the details.
                </p>
                <Button onClick={() => setIsSubmitted(false)} className="bg-accent text-accent-foreground hover:bg-gold-600" data-testid="button-new-reservation">
                  Make Another Reservation
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ScoreTicker />
      <Navbar />
      
      <section className="py-16 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4 uppercase tracking-tight">
              Reserve Your Table
            </h1>
            <p className="text-xl text-muted-foreground">Secure your spot for the big game</p>
          </div>

          <Card className="card-shadow">
            <CardContent className="p-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} data-testid="input-full-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="john@example.com" {...field} data-testid="input-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="(555) 123-4567" {...field} data-testid="input-phone" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="people"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Party Size</FormLabel>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                            <FormControl>
                              <SelectTrigger data-testid="select-party-size">
                                <SelectValue placeholder="Select party size" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1">1 Person</SelectItem>
                              <SelectItem value="2">2 People</SelectItem>
                              <SelectItem value="3">3 People</SelectItem>
                              <SelectItem value="4">4 People</SelectItem>
                              <SelectItem value="5">5 People</SelectItem>
                              <SelectItem value="6">6+ People</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="dateTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date & Time</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} data-testid="input-datetime" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Special Requests</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Any special requests or notes..." rows={3} {...field} data-testid="textarea-notes" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full bg-accent text-accent-foreground hover:bg-gold-600 glow-gold text-lg py-4"
                    disabled={reservation.isPending}
                    data-testid="button-submit-reservation"
                  >
                    {reservation.isPending ? "Confirming..." : "Confirm Reservation"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
