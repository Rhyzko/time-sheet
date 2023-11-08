export const useTimesheetStore = defineStore('timesheet', () => {
    const {
        getTimeSheet,
        updateTimeSheet,
        createTimeSheet,
        monthTimeSheet,
    } = useTimeSheetDatabase()

    const user = useSupabaseUser()
    const timeSheetRowsStyled = ref<TimeRow[]>([])
    const timeSheetRowsHistory = ref<TimeRow[][]>([])
    const isTimeSheetCreated = ref(false)
    const currentDate = ref(new Date())
    const timeSheetEdited = ref(false)

    function checkRow(row: any) {
        const totalValues = row.halfDay ? ['3.8', '3.9'] : ['7.7'];
        const impactedRows = timeSheetRowsStyled.value.filter((r) => r.date === row.date);
        const total = impactedRows.reduce((acc, r) => acc + Number(r.timeSpent), 0);
        impactedRows.forEach((r) => {
            r.class = totalValues.includes(total.toFixed(1)) ? 'bg-green-100 dark:bg-green-900' : 'bg-orange-100 dark:bg-orange-900';
        });
    };

    async function getTimesheet(dateId: string) {
        currentDate.value = new Date(dateId);
        const userId = user.value?.id ?? ''
        await getTimeSheet(dateId, userId)

        isTimeSheetCreated.value = monthTimeSheet.value !== undefined
        timeSheetRowsStyled.value = [...(monthTimeSheet.value?.content ?? []).map((row: TimeRow) => {
            return {
                ...row,
                class: row.type === 'off' ? 'bg-red-100 dark:bg-red-900' : row.type === 'weekend' ? 'bg-gray-200 dark:bg-slate-600' : 'py-0'
            }
        })]
        const selectedMonthAndYear = useDateFormat(currentDate.value, 'YYYY-MM').value;
        const currentMonthAndYear = useDateFormat(new Date(), 'YYYY-MM').value;
        if (selectedMonthAndYear < currentMonthAndYear) {
            timeSheetRowsStyled.value.filter(row => row.type === 'work').forEach((row) => {
                checkRow(row);
            });
        } else {
            timeSheetRowsStyled.value.filter(row => row.type === 'work'
                && row.date && parseInt(row.date.slice(-5, -3)) <= new Date().getDate()
            ).forEach((row) => {
                checkRow(row);
            });
        }
    }

    async function createTimesheet() {
        formatMonthTable(currentDate.value.getMonth() + 1)
        const timeSheet: TimeSheet = {
            label: useDateFormat(currentDate.value, 'YYYY-MM').value,
            userId: user.value?.id ?? '',
            content: timeSheetRowsStyled.value
        }
        const res = await createTimeSheet(timeSheet)
        if (res) {
            isTimeSheetCreated.value = true;
        }
    }

    async function updateTimesheet() {
        return await updateTimeSheet(timeSheetRowsStyled.value)
    }

    function splitDay(row: TimeRow, index: number) {
        const insertIndex = timeSheetRowsStyled.value.filter(r => r.date === row.date).length - 1 + index
        timeSheetRowsStyled.value.splice(insertIndex + 1, 0, {
            date: row.date,
            client: '',
            subject: '',
            comment: '',
            timeSpent: 0,
            class: row.class,
            type: row.type,
            halfDay: row.halfDay
        })
    }

    function formatMonthTable(month: number) {
        const numDaysInMonth = new Date(new Date().getFullYear(), month, 0).getDate();
        timeSheetRowsStyled.value = [];
        for (let i = 1; i <= numDaysInMonth; i++) {
            const date = new Date(new Date().getFullYear(), month - 1, i);
            timeSheetRowsStyled.value.push({
                date: useDateFormat(date, 'ddd DD-MM').value,
                client: '',
                subject: '',
                comment: '',
                type: getDayType(date)
            })
        }
    }

    function getDayType(date: Date) {
        const day = date.getDay();
        if (day === 0 || day === 6) {
            return 'weekend';
        }
        return 'work';
    }

    function undo() {
    }

    function redo() {
    }

    watch(() => timeSheetRowsStyled, () => {
        timeSheetEdited.value = true
    }, { deep: true })

    return {
        timeSheetRowsStyled,
        timeSheetRowsHistory,
        isTimeSheetCreated,
        currentDate,
        monthTimeSheet,
        timeSheetEdited,
        getTimesheet,
        updateTimesheet,
        createTimesheet,
        checkRow,
        splitDay,
        undo,
        redo
    }
})