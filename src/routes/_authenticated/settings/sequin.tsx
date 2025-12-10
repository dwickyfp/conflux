import { createFileRoute } from '@tanstack/react-router'
import { SequinSettingsForm } from '@/features/sequin/components/SequinSettingsForm'


export const Route = createFileRoute('/_authenticated/settings/sequin')({
  component: SequinSettingsPage,
})

function SequinSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Sequin Configuration</h3>
        <p className="text-sm text-muted-foreground">
          Manage your Sequin Management API connection.
        </p>
      </div>
      <SequinSettingsForm />
    </div>
  )
}
