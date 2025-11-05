import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Activity } from "lucide-react";

interface ApiMetricsProps {
  apiStats: {
    totalRequests: number;
    avgResponseTime: number;
    dataTransferred: {
      requestBytes: number;
      responseBytes: number;
    };
  };
}

const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (
    Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  );
};

export function ApiMetrics({ apiStats }: ApiMetricsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Requests
            </CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {apiStats.totalRequests.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mt-1">API calls</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Response Time
            </CardTitle>
            <Zap className="h-4 w-4 text-green-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {apiStats.avgResponseTime.toFixed(0)}ms
          </div>
          <p className="text-xs text-muted-foreground mt-1">per request</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Request Data
            </CardTitle>
            <Activity className="h-4 w-4 text-purple-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatBytes(apiStats.dataTransferred.requestBytes)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">uploaded</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Response Data
            </CardTitle>
            <Activity className="h-4 w-4 text-orange-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatBytes(apiStats.dataTransferred.responseBytes)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">downloaded</p>
        </CardContent>
      </Card>
    </div>
  );
}
