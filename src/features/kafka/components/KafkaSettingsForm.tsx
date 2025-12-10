import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { toast } from 'sonner';
import { settingsApi } from '@/features/sequin/api/settings'; // Reuse API from sequin feature for now, or move to shared
import { useEffect, useState } from 'react';

const formSchema = z.object({
    kafka_url: z.string().min(1, { message: 'Kafka URL is required.' }),
});

export function KafkaSettingsForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [otherSettings, setOtherSettings] = useState<{ sequin_url: string; sequin_token?: string }>({ 
        sequin_url: '', 
        sequin_token: '' 
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            kafka_url: 'localhost:9092',
        },
    });

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const data = await settingsApi.getSettings();
                form.reset({
                    kafka_url: data.kafka_url,
                });
                setOtherSettings({ 
                    sequin_url: data.sequin_url,
                    sequin_token: data.sequin_token 
                });
            } catch (error) {
                toast.error('Failed to load settings');
            }
        };
        loadSettings();
    }, [form]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        try {
            await settingsApi.updateSettings({
                ...values,
                ...otherSettings,
            });
            toast.success('Kafka settings saved successfully');
        } catch (error) {
            toast.error('Failed to save settings');
        } finally {
            setIsLoading(false);
        }
    }

    async function onTestConnection() {
        setIsTesting(true);
        try {
            // Save first
             await settingsApi.updateSettings({
                ...form.getValues(),
                ...otherSettings,
            });
            const result = await settingsApi.testKafka();
            if (result.connected) {
                toast.success('Kafka connection successful');
            } else {
                toast.error(`Kafka connection failed: ${result.error || ''}`);
            }
        } catch (error) {
            toast.error('Failed to test connection');
        } finally {
            setIsTesting(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full max-w-2xl">
                <FormField
                    control={form.control}
                    name="kafka_url"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Kafka Broker URL</FormLabel>
                            <FormControl>
                                <Input placeholder="localhost:9092" {...field} />
                            </FormControl>
                            <FormDescription>
                                The connection string for your Kafka broker.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex space-x-4">
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Saving...' : 'Save Settings'}
                    </Button>
                    <Button type="button" variant="outline" onClick={onTestConnection} disabled={isTesting}>
                        {isTesting ? 'Testing...' : 'Test Connection'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
