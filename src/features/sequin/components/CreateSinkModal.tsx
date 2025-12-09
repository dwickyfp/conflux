import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { sequinApi } from '../api/sequin';

const formSchema = z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
    database_id: z.string().min(1, { message: 'Please select a database.' }),
    kafka_topic: z.string().min(1, { message: 'Kafka topic is required.' }),
    create_topic: z.boolean(),
});

interface CreateSinkModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function CreateSinkModal({ open, onOpenChange, onSuccess }: CreateSinkModalProps) {
    const [databases, setDatabases] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            database_id: '',
            kafka_topic: '',
            create_topic: true,
        },
    });

    useEffect(() => {
        if (open) {
            const fetchDbs = async () => {
                try {
                    const data = await sequinApi.listDatabases();
                    setDatabases(Array.isArray(data) ? data : data.data || []);
                } catch (error) {
                    console.error(error);
                    toast.error('Failed to load databases');
                }
            };
            fetchDbs();
        }
    }, [open]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        try {
            // Construct the payload expected by Sequin (via our Backend Proxy)
            // Note: We're simplifying here. Real Sequin `create_sink` payload is more complex.
            // We will handle the complexity in the backend or match Sequin's expectation here.
            // Based on docs scraped:
            // {
            //   "name": "kafka-ids",
            //   "destination": { "type": "kafka", "topic": "records" },
            //   ...
            // }

            const payload = {
                name: values.name,
                database_id: values.database_id, // Might need to pass ID or Name depending on Sequin API
                destination: {
                    type: 'kafka',
                    topic: values.kafka_topic,
                },
                create_topic_if_not_exists: values.create_topic // Custom flag for our backend to handle
            };

            await sequinApi.createSink(payload);
            toast.success('Sink created successfully');
            form.reset();
            onSuccess();
        } catch (error) {
            toast.error('Failed to create sink');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Sink</DialogTitle>
                    <DialogDescription>
                        Connect a Postgres database to a Kafka topic.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Sink Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="my-kafka-sink" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="database_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Source Database</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a database" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {databases.map((db) => (
                                                <SelectItem key={db.id} value={db.id}>
                                                    {db.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="kafka_topic"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Kafka Topic</FormLabel>
                                    <FormControl>
                                        <Input placeholder="topic-name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="create_topic"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>
                                            Auto-create Kafka Topic
                                        </FormLabel>
                                        <FormDescription>
                                            If the topic doesn't exist, create it automatically.
                                        </FormDescription>
                                    </div>
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? 'Creating...' : 'Create Sink'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
