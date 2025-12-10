import { createLazyFileRoute } from '@tanstack/react-router'
import { SinkList } from '@/features/sequin/components/SinkList'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'

export const Route = createLazyFileRoute('/_authenticated/sinks')({
    component: SinksPage,
})

function SinksPage() {
    return (
        <>
            <Header>
                <Search />
                <div className='ms-auto flex items-center space-x-4'>
                    <ThemeSwitch />
                    <ConfigDrawer />
                    <ProfileDropdown />
                </div>
            </Header>
            <Main>
                <div className="mb-2 flex items-center justify-between space-y-2">
                    <h1 className="text-2xl font-bold tracking-tight">Sinks</h1>
                </div>
                <SinkList />
            </Main>
        </>
    )
}
