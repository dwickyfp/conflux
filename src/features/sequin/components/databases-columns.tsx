import { type ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/data-table'
import { DatabasesRowActions } from './databases-row-actions'
import { SequinDatabase } from '../api/databases'
// import { DatabasesRowActions } from './databases-row-actions' // To be created

export const databasesColumns: ColumnDef<SequinDatabase>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ row }) => <div className='font-medium'>{row.getValue('name')}</div>,
    enableSorting: true,
  },
  {
    accessorKey: 'hostname',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Hostname' />
    ),
    cell: ({ row }) => <div className='truncate max-w-[200px]'>{row.getValue('hostname')}</div>,
  },
  {
    accessorKey: 'database',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Database' />
    ),
  },
  {
    accessorKey: 'username',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Username' />
    ),
  },
  {
    accessorKey: 'port',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Port' />
    ),
    cell: ({ row }) => <div>{row.getValue('port')}</div>,
  },

  {
    id: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const database = row.original
      const slotStatus = database.replication_slots?.[0]?.status
      const isActive = slotStatus === 'active'
      return (
        <Badge 
          variant={isActive ? 'default' : 'secondary'}
          className={isActive ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400 hover:bg-gray-500'}
        >
          {isActive ? 'Stream' : 'Pause'}
        </Badge>
      )
    },
  },
  // {
  //   id: 'actions',
  //   cell: ({ row }) => <DatabasesRowActions row={row} />,
  // },
  {
    id: 'actions',
    cell: ({ row }) => <DatabasesRowActions row={row} />,
  },
]
