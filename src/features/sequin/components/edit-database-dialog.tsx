import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { useUpdateSequinDatabase } from '../hooks/useSequinDatabases'
import { SequinDatabase } from '../api/databases'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  hostname: z.string().min(1, 'Hostname is required'),
  port: z.coerce.number().min(1, 'Port is required'),
  database: z.string().min(1, 'Database is required'),
  username: z.string().min(1, 'Username is required'),
  password: z.string().optional(),
  ssl: z.boolean().default(true),
  use_local_tunnel: z.boolean().default(false),
  ipv6: z.boolean().default(false),
  publication_name: z.string().optional(),
  slot_name: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface EditDatabaseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  database: SequinDatabase
}

export function EditDatabaseDialog({
  open,
  onOpenChange,
  database,
}: EditDatabaseDialogProps) {
  const updateDatabase = useUpdateSequinDatabase()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: database.name,
      hostname: database.hostname,
      port: database.port,
      database: database.database,
      username: database.username,
      password: '', // Password is usually not returned or should be empty on edit unless changed
      ssl: database.ssl,
      use_local_tunnel: database.use_local_tunnel,
      ipv6: database.ipv6,
      publication_name: database.replication_slots?.[0]?.publication_name || '',
      slot_name: database.replication_slots?.[0]?.slot_name || '',
    },
  })

  // Update form values when database changes
  useEffect(() => {
    if (open) {
      form.reset({
        name: database.name,
        hostname: database.hostname,
        port: database.port,
        database: database.database,
        username: database.username,
        password: '',
        ssl: database.ssl,
        use_local_tunnel: database.use_local_tunnel,
        ipv6: database.ipv6,
        publication_name: database.replication_slots?.[0]?.publication_name || '',
        slot_name: database.replication_slots?.[0]?.slot_name || '',
      })
    }
  }, [database, open, form])

  const onSubmit = (values: FormValues) => {
    // If password is empty, don't send it (or backend handles it)
    // Sequin API usually requires current config.
    // If we send empty password, does it overwrite? Use undefined?
    // Backend service update_database:
    // payload = data.model_dump(exclude_unset=True)
    // Here we should probably only include password if it's set.
    
    // However, Pydantic model SequinDatabaseUpdate has all fields optional?
    // Let's check Schema. sequein_database.py
    // SequinDatabaseCreate has password: str
    // SequinDatabaseUpdate has name etc as optional.
    
    // But Sequin API `update` usually requires full object or merge?
    // Docs said `POST /api/postgres_databases/{id}`. 
    // Assuming backend handles partial updates if schema allows.
    // Ideally we pass non-empty string.
    
    // For now I'll pass it as is. If empty string is passed, backend/Sequin might fail or clear it.
    // Better to exclude it if empty.
    
    const payload: any = { ...values }
    if (!payload.password) {
        delete payload.password
    }
    
    if (values.publication_name && values.slot_name) {
      // Must include the existing replication slot ID for updates
      const existingSlotId = database.replication_slots?.[0]?.id
      payload.replication_slots = [
        {
          ...(existingSlotId && { id: existingSlotId }),
          publication_name: values.publication_name,
          slot_name: values.slot_name,
        },
      ]
    }
    delete payload.publication_name
    delete payload.slot_name

    updateDatabase.mutate(
      { id: database.id, data: payload },
      {
        onSuccess: () => {
          onOpenChange(false)
          toast.success('Database updated successfully')
        },
        onError: (error) => {
          toast.error(`Failed to update database: ${error.message}`)
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Database</DialogTitle>
          <DialogDescription>
            Update the connection details for the Postgres database.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name</FormLabel>
                  <FormControl>
                    <Input placeholder="production-db" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="hostname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hostname</FormLabel>
                    <FormControl>
                      <Input placeholder="localhost" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="port"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Port</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="5432" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="database"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Database Name</FormLabel>
                  <FormControl>
                    <Input placeholder="postgres" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="postgres" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Leave empty to keep unchanged"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="submit"
                disabled={updateDatabase.isPending}
              >
                {updateDatabase.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
