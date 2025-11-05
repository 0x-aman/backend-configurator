import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Users } from "lucide-react";

interface TopClient {
  id: string;
  name: string;
  email: string;
  companyName: string;
  _count: {
    configurators: number;
    quotes: number;
  };
}

interface TopClientsLeaderboardProps {
  clients: TopClient[];
}

export function TopClientsLeaderboard({ clients }: TopClientsLeaderboardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-yellow-500" />
          <CardTitle>Top Clients</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {clients.length > 0 ? (
            clients.map((client, idx) => (
              <div
                key={client.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-xs font-bold">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{client.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {client.companyName}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    <Users className="h-3 w-3 mr-1" />
                    {client._count.configurators}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {client._count.quotes} quotes
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No clients yet
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
