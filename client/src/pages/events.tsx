import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import ScoreTicker from "@/components/score-ticker";
import EventCard from "@/components/event-card";

export default function Events() {
  const { data: events } = useQuery({
    queryKey: ["/api/events"],
  });

  return (
    <div className="min-h-screen bg-background">
      <ScoreTicker />
      <Navbar />
      
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4 uppercase tracking-tight">
              Events
            </h1>
            <p className="text-xl text-muted-foreground">Don't miss the action at Supano's</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events?.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          {!events?.length && (
            <div className="text-center py-12" data-testid="text-no-events">
              <p className="text-xl text-muted-foreground">No events scheduled</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
