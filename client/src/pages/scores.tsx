import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import ScoreTicker from "@/components/score-ticker";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Scores() {
  const [selectedDate, setSelectedDate] = useState("today");

  const getDate = (offset: number) => {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return date.toISOString().split('T')[0];
  };

  const { data: scores } = useQuery({
    queryKey: ["/api/scores", selectedDate === "today" ? getDate(0) : selectedDate === "yesterday" ? getDate(-1) : getDate(1)],
    queryFn: () => {
      const date = selectedDate === "today" ? getDate(0) : selectedDate === "yesterday" ? getDate(-1) : getDate(1);
      return fetch(`/api/scores?date=${date}`).then(res => res.json());
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  return (
    <div className="min-h-screen bg-background">
      <ScoreTicker />
      <Navbar />
      
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4 uppercase tracking-tight">
              Live Scores
            </h1>
            <p className="text-xl text-muted-foreground">Stay updated with all the action</p>
          </div>

          {/* Date Selector */}
          <div className="flex justify-center mb-8">
            <div className="bg-card rounded-xl p-1 inline-flex">
              <Button
                variant={selectedDate === "yesterday" ? "default" : "ghost"}
                onClick={() => setSelectedDate("yesterday")}
                className={selectedDate === "yesterday" ? "bg-accent text-accent-foreground" : ""}
                data-testid="button-yesterday"
              >
                Yesterday
              </Button>
              <Button
                variant={selectedDate === "today" ? "default" : "ghost"}
                onClick={() => setSelectedDate("today")}
                className={selectedDate === "today" ? "bg-accent text-accent-foreground" : ""}
                data-testid="button-today"
              >
                Today
              </Button>
              <Button
                variant={selectedDate === "tomorrow" ? "default" : "ghost"}
                onClick={() => setSelectedDate("tomorrow")}
                className={selectedDate === "tomorrow" ? "bg-accent text-accent-foreground" : ""}
                data-testid="button-tomorrow"
              >
                Tomorrow
              </Button>
            </div>
          </div>

          {/* NFL Scores */}
          <div className="mb-8">
            <h2 className="text-2xl font-display font-bold text-foreground mb-4 uppercase tracking-wide">
              <i className="fas fa-football-ball text-accent mr-2"></i>NFL
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {scores?.leagues?.NFL?.map((game) => (
                <Card key={game.id} className="card-shadow" data-testid={`card-nfl-game-${game.id}`}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <span className={`font-numeric font-bold text-sm ${
                        game.status === "live" ? "text-accent animate-pulse-gold" : 
                        game.status === "final" ? "text-success" : "text-muted-foreground"
                      }`}>
                        {game.status === "live" ? "LIVE" : 
                         game.status === "final" ? "FINAL" : 
                         new Date(game.startTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                      </span>
                      <span className="text-muted-foreground text-sm" data-testid={`text-game-details-${game.id}`}>
                        {game.details?.quarter} {game.details?.clock}
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold" data-testid={`text-away-team-${game.id}`}>{game.away.name}</span>
                        <span className="text-2xl font-numeric font-bold text-accent" data-testid={`text-away-score-${game.id}`}>
                          {game.away.score || "-"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-semibold" data-testid={`text-home-team-${game.id}`}>{game.home.name}</span>
                        <span className="text-2xl font-numeric font-bold" data-testid={`text-home-score-${game.id}`}>
                          {game.home.score || "-"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* MLB Scores */}
          <div>
            <h2 className="text-2xl font-display font-bold text-foreground mb-4 uppercase tracking-wide">
              <i className="fas fa-baseball-ball text-accent mr-2"></i>MLB
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {scores?.leagues?.MLB?.map((game) => (
                <Card key={game.id} className="card-shadow" data-testid={`card-mlb-game-${game.id}`}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <span className={`font-numeric font-bold text-sm ${
                        game.status === "live" ? "text-accent animate-pulse-gold" : 
                        game.status === "final" ? "text-success" : "text-muted-foreground"
                      }`}>
                        {game.status === "live" ? "LIVE" : 
                         game.status === "final" ? "FINAL" : 
                         new Date(game.startTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                      </span>
                      <span className="text-muted-foreground text-sm" data-testid={`text-game-details-${game.id}`}>
                        {game.details?.inning} {game.details?.outs}
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold" data-testid={`text-away-team-${game.id}`}>{game.away.name}</span>
                        <span className="text-2xl font-numeric font-bold text-accent" data-testid={`text-away-score-${game.id}`}>
                          {game.away.score || "-"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-semibold" data-testid={`text-home-team-${game.id}`}>{game.home.name}</span>
                        <span className="text-2xl font-numeric font-bold" data-testid={`text-home-score-${game.id}`}>
                          {game.home.score || "-"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {!scores?.leagues?.NFL?.length && !scores?.leagues?.MLB?.length && (
            <div className="text-center py-12" data-testid="text-no-games">
              <p className="text-xl text-muted-foreground">No games scheduled for this date</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
