import { createLazyFileRoute } from '@tanstack/react-router'
import { SettingsForm } from '@/features/sequin/components/SettingsForm'

export const Route = createLazyFileRoute('/_authenticated/sequin-settings')({
    component: SettingsPage,
})

function SettingsPage() {
    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            </div>
            <SettingsForm />
        </div>
    )
}
