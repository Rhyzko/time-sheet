declare interface TimeRow {
    date?: string
    client?: string
    subject?: string
    timeSpent?: number
    comment?: string
    amp?: string;
    ampFilled?: boolean;
    type?: 'work' | 'weekend' | 'off'
    class?: string
    halfDay?: boolean
}

declare interface Client {
    label: string,
    id: number,
    color: string | null,
    tags: string | null,
    chargeable: boolean | undefined | null
}

declare interface ClientByUser extends Client {
    visible: RemovableRef<boolean>
}

declare interface TimeSheet {
    id?: number,
    label: string,
    userId: string,
    content: Json
}

declare interface UserTimeSheet extends TimeSheet {
    user: UserTimeSheetProfile | null
    timeRows: TimeRow[]
}

declare interface UserTimeSheetProfile {
    id: string,
    firstName: string | null,
    lastName: string | null,
    email: string | null,
}

declare interface User {
    id: string,
    email: string,
    role: 'Developer' | 'Manager'
}