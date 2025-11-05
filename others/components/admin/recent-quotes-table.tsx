import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";

interface Quote {
  id: string;
  totalPrice: string;
  status: string;
  customerEmail: string;
  createdAt: string;
  client: {
    name: string;
    email: string;
  };
}

interface RecentQuotesTableProps {
  quotes: Quote[];
}

const getStatusColor = (status: string) => {
  switch (status.toUpperCase()) {
    case "ACCEPTED":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "REJECTED":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    case "PENDING":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  }
};

export function RecentQuotesTable({ quotes }: RecentQuotesTableProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-500" />
          <CardTitle>Recent Quotes</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {quotes.length > 0 ? (
            quotes.map((quote) => (
              <div
                key={quote.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {quote.client.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {quote.customerEmail}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <div className="text-right">
                    <p className="font-semibold text-sm">
                      ${Number.parseFloat(quote.totalPrice).toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(quote.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className={getStatusColor(quote.status)}>
                    {quote.status}
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No quotes yet
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
