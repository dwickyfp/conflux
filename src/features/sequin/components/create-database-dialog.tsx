import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Switch } from '@/components/ui/switch'
import { useCreateSequinDatabase } from '../hooks/useSequinDatabases'
import { useState } from 'react'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  hostname: z.string().min(1, 'Hostname is required'),
  port: z.coerce.number().min(1, 'Port is required'),
  database: z.string().min(1, 'Database is required'),
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  ssl: z.boolean().default(true),
  use_local_tunnel: z.boolean().default(false),
  ipv6: z.boolean().default(false),
  publication_name: z.string().optional(),
  slot_name: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export function CreateDatabaseDialog() {
  const [open, setOpen] = useState(false)
  const createDatabase = useCreateSequinDatabase()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: '',
      hostname: '',
      port: 5432,
      database: '',
      username: '',
      password: '',
      ssl: true,
      use_local_tunnel: false,
      ipv6: false,
      publication_name: 'sequin_pub',
      slot_name: 'sequin_slot',
    },
  })

  function onSubmit(values: FormValues) {
    const payload: any = { ...values }
    if (values.publication_name && values.slot_name) {
      payload.replication_slots = [
        {
          publication_name: values.publication_name,
          slot_name: values.slot_name,
        },
      ]
    }
    // Remove individual fields if backend doesn't expect them (which it doesn't, though extra fields are often ignored)
    // Sequin API strictness? Better to clean up.
    delete payload.publication_name
    delete payload.slot_name

    createDatabase.mutate(payload, {
      onSuccess: () => {
        setOpen(false)
        form.reset()
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Database</Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px] overflow-y-auto max-h-[90vh]'>
        <DialogHeader>
          <DialogTitle>Add Database</DialogTitle>
          <DialogDescription>
            Connect a new Postgres database to Sequin.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder='production-db' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='grid grid-cols-2 gap-4'>
                <FormField
                control={form.control}
                name='hostname'
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Hostname</FormLabel>
                    <FormControl>
                        <Input placeholder='db.example.com' {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name='port'
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Port</FormLabel>
                    <FormControl>
                        <Input type='number' {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <FormField
              control={form.control}
              name='database'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Database</FormLabel>
                  <FormControl>
                    <Input placeholder='postgres' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='username'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder='postgres' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type='password' placeholder='********' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='ssl'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm'>
                  <div className='space-y-0.5'>
                    <FormLabel>SSL</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="publication_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Publication Name</FormLabel>
                    <FormControl>
                      <Input placeholder="sequin_pub" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="slot_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slot Name</FormLabel>
                    <FormControl>
                      <Input placeholder="sequin_slot" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type='submit' disabled={createDatabase.isPending}>
                {createDatabase.isPending ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
