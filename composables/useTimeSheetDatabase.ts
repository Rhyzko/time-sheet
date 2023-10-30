import type { Database } from "~/types/supabase";
export default function useTimeSheetDatabase() {
    const supabase = useSupabaseClient<Database>();

    const clientList = ref<Client[]>([])

    const fetchClients = async () => {
        const { data, error } = await supabase.from('clients').select('*')
        if (error) {
            console.error(error)
        } else {
            clientList.value = data ?? []
        }
    }

    const addClient = async (label: string) => {
        const { data, error } = await supabase.from('clients').insert([{ label: label }]).select('id, label, color, tags')
        if (error) {
            console.error(error)
        } else {
            clientList.value = clientList.value.concat(data ?? [])
        }
    }

    const deleteClient = async (id: number) => {
        const { data, error } = await supabase.from('clients').delete().match({ id })
        if (error) {
            console.error(error)
        } else {
            clientList.value = clientList.value.filter((client) => client.id !== id)
        }
    }

    const updateClientColor = async (id: number, color: string) => {
        const { data, error } = await supabase.from('clients').update({ color }).match({ id })
        if(error) {
            console.error(error)
        } else {
            clientList.value = clientList.value.map((client) => {
                if(client.id === id) {
                    return {
                        ...client,
                        color
                    }
                } else {
                    return client
                }
            })
        }
    }

    return {
        clientList,
        fetchClients,
        addClient,
        deleteClient,
        updateClientColor
    }
}
