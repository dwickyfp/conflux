import { useState } from 'react'
import { Row } from '@tanstack/react-table'
import { MoreHorizontal, Pencil, Trash, RefreshCw, Pause, Play } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SequinDatabase } from '../api/databases'
import { useDeleteSequinDatabase, useRefreshTables, useUpdateSequinDatabase } from '../hooks/useSequinDatabases'
import { EditDatabaseDialog } from './edit-database-dialog'
import { toast } from 'sonner'

interface DatabasesRowActionsProps<TData> {
  row: Row<TData>
}

export function DatabasesRowActions<TData>({
  row,
}: DatabasesRowActionsProps<TData>) {
  const [showEditDialog, setShowEditDialog] = useState(false)
  const database = row.original as SequinDatabase

  const deleteDatabase = useDeleteSequinDatabase()
  const refreshTables = useRefreshTables()
  const updateDatabase = useUpdateSequinDatabase()

  // Get current replication slot status
  const currentSlot = database.replication_slots?.[0]
  const isActive = currentSlot?.status === 'active'

  const handleDelete = () => {
    deleteDatabase.mutate(database.id, {
        onSuccess: () => toast.success('Database deleted successfully'),
        onError: (err) => toast.error(`Error deleting database: ${err.message}`)
    })
  }

  const handleRefresh = () => {
    refreshTables.mutate(database.id, {
        onSuccess: () => toast.success('Tables refreshed successfully'),
        onError: (err) => toast.error(`Error refreshing tables: ${err.message}`)
    })
  }

  const handleToggleStatus = () => {
    if (!currentSlot?.id) {
      toast.error('No replication slot found')
      return
    }

    const newStatus = isActive ? 'disabled' : 'active'
    updateDatabase.mutate(
      {
        id: database.name, // Use name for Sequin API
        data: {
          name: database.name,
          hostname: database.hostname,
          port: database.port,
          database: database.database,
          username: database.username,
          replication_slots: [
            {
              id: currentSlot.id,
              status: newStatus,
            },
          ],
        },
      },
      {
        onSuccess: () => toast.success(`Database ${isActive ? 'paused' : 'resumed'} successfully`),
        onError: (err) => toast.error(`Error updating status: ${err.message}`),
      }
    )
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
            <Pencil className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleToggleStatus} disabled={!currentSlot?.id}>
            {isActive ? (
              <>
                <Pause className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                Pause
              </>
            ) : (
              <>
                <Play className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                Resume
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Refresh Tables
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDelete}>
            <Trash className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Delete
            <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {showEditDialog && (
        <EditDatabaseDialog
            open={showEditDialog}
            onOpenChange={setShowEditDialog}
            database={database}
        />
      )}
    </>
  )
}
