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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { settingsApi } from '../api/settings';
import { useEffect, useState } from 'react';

const formSchema = z.object({
    sequin_url: z.string().url({ message: 'Please enter a valid URL.' }),
    sequin_token: z.string().optional(),
    kafka_url: z.string().min(1, { message: 'Kafka URL is required.' }),
});

export function SettingsForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [isTesting, setIsTesting] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            sequin_url: 'https://api.sequinstream.com',
            sequin_token: '',
            kafka_url: 'localhost:9092',
        },
    });

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const data = await settingsApi.getSettings();
                form.reset({
                    sequin_url: data.sequin_url,
                    sequin_token: data.sequin_token || '',
                    kafka_url: data.kafka_url,
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
            await settingsApi.updateSettings(values);
            toast.success('Settings saved successfully');
        } catch (error) {
            toast.error('Failed to save settings');
        } finally {
            setIsLoading(false);
        }
    }

    async function onTestConnection() {
        setIsTesting(true);
        try {
            // Save first to ensure backend has latest creds to test with
            await settingsApi.updateSettings(form.getValues());
            const result = await settingsApi.testConnection();
            if (result.connected) {
                toast.success('Sequin connection successful');
            } else {
                toast.error('Sequin connection failed');
            }
        } catch (error) {
            toast.error('Failed to test connection');
        } finally {
            setIsTesting(false);
        }
    }

    return (
        <Card className="w-full max-w-2xl">
            <CardHeader>
                <CardTitle>Sequin & Kafka Configuration</CardTitle>
                <CardDescription>
                    Configure your Sequin Management API and Kafka connection details.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="sequin_url"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Sequin API URL</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://api.sequinstream.com" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        The base URL for the Sequin Management API.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="sequin_token"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Sequin API Token</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="sk_..." {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Your Sequin API token.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
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
            </CardContent>
        </Card>
    );
}
