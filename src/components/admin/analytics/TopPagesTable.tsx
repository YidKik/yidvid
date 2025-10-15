import { useGoogleAnalytics } from '@/hooks/useGoogleAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

export const TopPagesTable = () => {
  const { data, isLoading, error } = useGoogleAnalytics({ metricType: 'pages' });

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Pages</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Failed to load page data</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Pages</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const pages = data?.rows?.slice(0, 10) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Pages</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Page Path</TableHead>
              <TableHead className="text-right">Views</TableHead>
              <TableHead className="text-right">Avg. Duration (s)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pages.map((row: any, index: number) => (
              <TableRow key={index}>
                <TableCell className="font-medium">
                  {row.dimensionValues[0]?.value || '/'}
                </TableCell>
                <TableCell className="text-right">
                  {parseInt(row.metricValues[0]?.value || '0').toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  {parseFloat(row.metricValues[1]?.value || '0').toFixed(1)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
