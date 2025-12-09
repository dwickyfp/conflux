import { createLazyFileRoute } from '@tanstack/react-router'
import { SinkList } from '@/features/sequin/components/SinkList'

export const Route = createLazyFileRoute('/_authenticated/sinks')({
    component: SinksPage,
})

function SinksPage() {
    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Sinks</h1>
            </div>
            <SinkList />
        </div>
    )
}
