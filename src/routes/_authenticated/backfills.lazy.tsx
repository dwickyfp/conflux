import { createLazyFileRoute } from '@tanstack/react-router'
import { BackfillList } from '@/features/sequin/components/BackfillList'

export const Route = createLazyFileRoute('/_authenticated/backfills')({
    component: BackfillsPage,
})

function BackfillsPage() {
    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Backfills</h1>
            </div>
            <BackfillList />
        </div>
    )
}
