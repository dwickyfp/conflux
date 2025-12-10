import { useSequinDatabases } from '../hooks/useSequinDatabases'
import { DatabasesTable } from '../components/databases-table'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { CreateDatabaseDialog } from '../components/create-database-dialog'

export default function DatabasesPage() {
  const { data, isLoading } = useSequinDatabases()

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Databases</h2>
            <p className='text-muted-foreground'>
              Manage your Sequin Database connections.
            </p>
          </div>
          <CreateDatabaseDialog />
        </div>
        
        {isLoading ? (
            <div>Loading...</div>
        ) : (
            <DatabasesTable data={data?.data || []} />
        )}
      </Main>
    </>
  )
}
