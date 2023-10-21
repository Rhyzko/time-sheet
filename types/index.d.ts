declare interface TimeRow {
    date?: string
    client?: string
    project?: string
    timeSpent?: number
    comment?: string
    amp?: string;
  }

declare interface Client {
    label: string,
    id: number
}

declare interface Project {
    label: string,
    id: number,
    clientId: number
}

declare interface TimeSheet {
    id: number,
    label: string,
    userId: string,
    content: Json
}