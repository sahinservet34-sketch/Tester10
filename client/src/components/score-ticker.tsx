import { useQuery } from "@tanstack/react-query";

export default function ScoreTicker() {
  const { data: scores } = useQuery({
    queryKey: ["/api/scores"],
    queryFn: () => fetch("/api/scores").then(res => res.json()),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const allGames = [
    ...(scores?.leagues?.NFL || []),
    ...(scores?.leagues?.MLB || []),
  ];

  if (!allGames.length) {
    return (
      <div className="bg-primary border-b border-border overflow-hidden">
        <div className="py-2 text-sm font-numeric text-center">
          <span className="text-muted-foreground">Live scores will appear here during game times</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-primary border-b border-border overflow-hidden" data-testid="score-ticker">
      <div className="animate-marquee whitespace-nowrap py-2 text-sm font-numeric">
        {allGames.map((game, index) => (
          <span key={game.id} className="inline-flex items-center mx-8" data-testid={`ticker-game-${game.id}`}>
            <i className={`fas fa-${game.league === 'NFL' ? 'football' : 'baseball'}-ball text-accent mr-2`}></i>
            <span className={`${
              game.status === 'live' ? 'text-accent animate-pulse-gold' : 
              game.status === 'final' ? 'text-success' : 'text-muted-foreground'
            }`}>
              {game.status === 'live' ? 'LIVE' : 
               game.status === 'final' ? 'FINAL' : 
               new Date(game.startTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
            </span>
            <span className="mx-2">•</span>
            <span>{game.away.abbr} {game.away.score || 0} - {game.home.abbr} {game.home.score || 0}</span>
            {game.details?.quarter && (
              <>
                <span className="mx-2">•</span>
                <span className="text-muted-foreground">{game.details.quarter} {game.details.clock}</span>
              </>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
