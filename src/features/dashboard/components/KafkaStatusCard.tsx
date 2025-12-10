import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { settingsApi } from '@/features/sequin/api/settings';
import { Activity, Power, PowerOff } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function KafkaStatusCard() {
    const [isConnected, setIsConnected] = useState<boolean | null>(null);
    const [lastChecked, setLastChecked] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkConnection = async () => {
            try {
                const result = await settingsApi.testKafka();
                setIsConnected(result.connected);
                if (result.checked_at) {
                    setLastChecked(result.checked_at);
                }
            } catch (error) {
                setIsConnected(false);
            } finally {
                setIsLoading(false);
            }
        };
        checkConnection();
    }, []);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Kafka Connectivity</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="text-2xl font-bold text-muted-foreground">Checking...</div>
                ) : isConnected ? (
                    <>
                        <div className="text-2xl font-bold flex items-center text-green-600">
                            <Power className="mr-2 h-6 w-6" /> Online
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Connected to Kafka Broker
                        </p>
                    </>
                ) : (
                    <>
                        <div className="text-2xl font-bold flex items-center text-red-600">
                            <PowerOff className="mr-2 h-6 w-6" /> Offline
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Check your settings configuration
                        </p>
                    </>
                )}
                {lastChecked && (
                     <p className="text-xs text-muted-foreground mt-2">
                        Last checked: {formatDistanceToNow(new Date(lastChecked), { addSuffix: true })}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
