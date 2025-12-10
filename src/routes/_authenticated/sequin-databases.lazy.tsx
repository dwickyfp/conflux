import { createLazyFileRoute } from '@tanstack/react-router'
import DatabasesPage from '@/features/sequin/pages/databases-page'

export const Route = createLazyFileRoute('/_authenticated/sequin-databases')({
    component: DatabasesPage,
})
