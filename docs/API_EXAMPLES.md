# Playbook API Examples

Base URL: `http://localhost:5000/api`

## Teams

### List teams
```bash
curl http://localhost:5000/api/teams
```

### Create team
```bash
curl -X POST http://localhost:5000/api/teams \
  -H "Content-Type: application/json" \
  -d '{"name":"Eagles FC"}'
```

## Players

### List players (optional: ?teamId=)
```bash
curl "http://localhost:5000/api/players?teamId=11111111-1111-1111-1111-111111111111"
```

### Create player
```bash
curl -X POST http://localhost:5000/api/players \
  -H "Content-Type: application/json" \
  -d '{"name":"Alex Johnson","number":7,"position":"Forward","teamId":"11111111-1111-1111-1111-111111111111"}'
```

## Games

### List games
```bash
curl http://localhost:5000/api/games
```

### Create game
```bash
curl -X POST http://localhost:5000/api/games \
  -H "Content-Type: application/json" \
  -d '{"opponent":"Thunder United","date":"2025-03-01T19:00:00Z","teamId":"11111111-1111-1111-1111-111111111111"}'
```

### Get game events
```bash
curl http://localhost:5000/api/games/22222222-2222-2222-2222-222222222222/events
```

### Add event to game
```bash
curl -X POST http://localhost:5000/api/games/22222222-2222-2222-2222-222222222222/events \
  -H "Content-Type: application/json" \
  -d '{"playerId":"<player-guid>","timestamp":120,"type":"Goal","notes":"Header from cross"}'
```

## Clips

### List clips (?gameId=, ?playerId=)
```bash
curl "http://localhost:5000/api/clips?gameId=22222222-2222-2222-2222-222222222222"
```

### Create clip
```bash
curl -X POST http://localhost:5000/api/clips \
  -H "Content-Type: application/json" \
  -d '{"gameId":"22222222-2222-2222-2222-222222222222","startTimestamp":40,"endTimestamp":55,"playerId":"<player-guid>","title":"Johnson Header Goal"}'
```

## Analytics

### Plays per player (?teamId=)
```bash
curl "http://localhost:5000/api/analytics/plays-per-player"
```

### Event distribution (?gameId=, ?teamId=)
```bash
curl "http://localhost:5000/api/analytics/event-distribution"
```
