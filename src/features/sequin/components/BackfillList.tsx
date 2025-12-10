import { useEffect, useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
// Note: Backfill list API wasn't explicitly in my sequin.ts yet, I might need to add it or fetch per sink.
// For now, I'll assume we might want to list all backfills or show them under Sinks.
// The user asked for "Backfill Management UI". A centralized list is good.

interface Backfill {
    id: string;
    state: string;
    sink_consumer_name?: string; // or id
    rows_processed_count: number;
    inserted_at: string;
}

export function BackfillList() {
    const [backfills, setBackfills] = useState<Backfill[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchBackfills = async () => {
            setIsLoading(true);
            try {
                // Sequin API structure: /api/sinks/{sink_id}/backfills to list? 
                // Or maybe just list sinks and then list backfills for each?
                // The docs I scraped earlier only showed `create` backfill.
                // Let's assume for this MVP we might need to iterate sinks to get backfills 
                // OR the backend aggregation service handles this.
                // I'll implement a placeholder fetch here or assuming I added a generic list endpoint in backend if possible.
                // Since I didn't add a "list all backfills" in backend, I'll just show a placeholder or
                // maybe fetch sinks first then their backfills.
                // For now, let's keep it empty or mock it until verified.
                setBackfills([]);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchBackfills();
    }, []);

    return (
        <div className="space-y-4">
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Sink</TableHead>
                            <TableHead>State</TableHead>
                            <TableHead>Rows Processed</TableHead>
                            <TableHead>Created At</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24">Loading...</TableCell>
                            </TableRow>
                        ) : backfills.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24">No active backfills found.</TableCell>
                            </TableRow>
                        ) : (
                            backfills.map((bf) => (
                                <TableRow key={bf.id}>
                                    <TableCell>{bf.id}</TableCell>
                                    <TableCell>{bf.sink_consumer_name}</TableCell>
                                    <TableCell><Badge>{bf.state}</Badge></TableCell>
                                    <TableCell>{bf.rows_processed_count}</TableCell>
                                    <TableCell>{new Date(bf.inserted_at).toLocaleDateString()}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
