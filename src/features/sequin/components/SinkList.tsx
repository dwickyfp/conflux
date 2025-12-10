import { useEffect, useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { sequinApi } from '../api/sequin';
import { CreateSinkModal } from './CreateSinkModal';
import { toast } from 'sonner';

interface Sink {
    id: string;
    name: string;
    status: string;
    type: string;
    database_name?: string;
    inserted_at: string;
}

export function SinkList() {
    const [sinks, setSinks] = useState<Sink[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchSinks = async () => {
        setIsLoading(true);
        try {
            const data = await sequinApi.listSinks();
            // Adjust depending on actual API response structure (e.g. data.data or Just an array)
            setSinks(Array.isArray(data) ? data : data.data || []);
        } catch (error) {
            toast.error('Failed to fetch sinks');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSinks();
    }, []);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Active Sinks</h2>
                <Button onClick={() => setIsModalOpen(true)}>Create Sink</Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Database</TableHead>
                            <TableHead>Created At</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : sinks.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24">
                                    No sinks found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            sinks.map((sink) => (
                                <TableRow key={sink.id}>
                                    <TableCell className="font-medium">{sink.name}</TableCell>
                                    <TableCell>
                                        <Badge variant={sink.status === 'active' ? 'default' : 'secondary'}>
                                            {sink.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{sink.type}</TableCell>
                                    <TableCell>{sink.database_name || '-'}</TableCell>
                                    <TableCell>{new Date(sink.inserted_at).toLocaleDateString()}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <CreateSinkModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                onSuccess={() => {
                    setIsModalOpen(false);
                    fetchSinks();
                }}
            />
        </div>
    );
}
