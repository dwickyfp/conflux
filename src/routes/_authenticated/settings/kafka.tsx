import { createFileRoute } from '@tanstack/react-router'
import { KafkaSettingsForm } from '@/features/kafka/components/KafkaSettingsForm'

export const Route = createFileRoute('/_authenticated/settings/kafka')({
  component: KafkaSettingsPage,
})

function KafkaSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Kafka Configuration</h3>
        <p className="text-sm text-muted-foreground">
          Manage your Kafka broker connection.
        </p>
      </div>
      <KafkaSettingsForm />
    </div>
  )
}
