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
    tags: string | null
}

declare interface TimeSheet {
    id?: number,
    label: string,
    userId: string,
    content: Json
}