import type { Database } from "~/types/supabase";
export default function useTimeSheetDatabase() {
    const supabase = useSupabaseClient<Database>()

    const clientList = ref<Client[]>([])
    const monthTimeSheet = ref<TimeSheet | undefined>(undefined)

    const getTimeSheet = async (dateId: string, userId: string) => {
        const { data, error } = await supabase.from('timesheets').select('*').eq('userId', userId).eq('label', dateId)
        if (error) {
            console.error(error);
        } else {
            monthTimeSheet.value = data[0];
            return true
        }
    }

    const getTimeSheets = async (dateId: string) => {
        const { data, error } = await supabase
            .from('timesheets')
            .select(`
                *, 
                user:profiles ( id, firstName, lastName, email)
                `)
            .eq('label', dateId)

        if (error) {
            console.error(error);
        } else {
            return data;
        }
    }

    const updateTimeSheet = async (timeSheetRows: any) => {
        const { data, error } = await supabase.from('timesheets').update({ content: timeSheetRows }).match({ id: monthTimeSheet.value?.id ?? 0 }).select('*')
        if (error) {
            console.error(error);
        } else {
            monthTimeSheet.value = data[0];
            return true
        }
    };

    const createTimeSheet = async (timeSheet: TimeSheet) => {
        const { label, userId, content } = timeSheet
        const { data, error } = await supabase.from('timesheets').upsert([{ label, userId, content }]).select('*')
        if (error) {
            console.error(error);
        } else {
            monthTimeSheet.value = data[0]
            return true
        }
    }

    const fetchClients = async () => {
        const { data, error } = await supabase.from('clients').select('*')
        if (error) {
            console.error(error)
        } else {
            clientList.value = data?.sort((a, b) => a.label.localeCompare(b.label)) ?? []
        }
    }

    const addClient = async (label: string) => {
        const { data, error } = await supabase.from('clients').insert([{ label: label }]).select('id, label, color, tags, chargeable')
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
        if (error) {
            console.error(error)
        } else {
            clientList.value = clientList.value.map((client) => {
                if (client.id === id) {
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

    const getCurrentUser = async (userId: string) => {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', userId)
        if (error) {
            console.error(error);
        } else {
            return data[0];
        }
    }

    return {
        clientList,
        monthTimeSheet,
        fetchClients,
        addClient,
        deleteClient,
        updateClientColor,
        getTimeSheet,
        getTimeSheets,
        updateTimeSheet,
        createTimeSheet,
        getCurrentUser
    }
}
