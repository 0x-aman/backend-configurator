import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsOverviewProps {
  data: {
    totalClients: number;
    activeClients: number;
    totalConfigurators: number;
    publishedConfigurators: number;
  };
}

export function StatsOverview({ data }: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.totalClients}</div>
        </CardContent>
      </Card>
    </div>
  );
}
