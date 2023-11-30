<script setup lang="ts">
definePageMeta({
    middleware: 'dashboard-middleware'
})
const userStore = useUserStore()
const timesheetStore = useTimesheetStore()
const { clientList, fetchClients } = useTimeSheetDatabase()

const { currentDate, currentDateId, timesheets } = storeToRefs(timesheetStore)
const { getTimesheets } = timesheetStore

const { getUser } = userStore
const { getColorLabelFromCode } = useColor()

onMounted(async () => {
    await fetchClients()
    await getUser()
    await getTimesheets(currentDateId.value)
})

const setNextMonth = async () => {
    const nextMonthDateId = useDateFormat(currentDate.value.setMonth(currentDate.value.getMonth() + 1), 'YYYY-MM').value;
    await navigateTo(`/dashboard/${nextMonthDateId}`)
};

const setPrevMonth = async () => {
    const prevMonthDateId = useDateFormat(currentDate.value.setMonth(currentDate.value.getMonth() - 1), 'YYYY-MM').value;
    await navigateTo(`/dashboard/${prevMonthDateId}`)
};

const timeGroupedByClient = computed(() => {
    const timeByClientArray: any[] = []
    timesheets.value.reduce((acc, timesheet) => {
        timesheet.timeRows.forEach((row: TimeRow) => {
            if (!isNaN(Number(row.timeSpent))) {
                if (!timeByClientArray.find((c) => c.client === row.client)) {
                    timeByClientArray.push({ client: row.client, timeSpent: Number(row.timeSpent) })
                }
                else {
                    timeByClientArray.find((c) => c.client === row.client).timeSpent += Number(row.timeSpent)
                }
            }
        })
        return acc
    }, {})
    return timeByClientArray.map((c) => {
        return {
            label: c.client,
            value: c.timeSpent,
            color: clientList.value.find((c) => c.label === c.label)?.color,
            chargeable: clientList.value.find((c) => c.label === c.label)?.chargeable
        }
    })
})

const getTotalClientForUser = (user: UserTimeSheet, client: Client, dayDisplay: boolean = false) => {
    const rows = user.timeRows.filter(r => r.client === client.label).map(r => r.timeSpent)
    const total = rows.reduce((acc, row) => {
        if (!acc) {
            acc = 0
        }
        if (!isNaN(Number(row))) {
            return acc + Number(row)
        }
    }, 0)
    return total ? dayDisplay ? (total / 7.7).toFixed(1) : total.toFixed(1) : ''
}

const totalTimeSpentByUser = (user: UserTimeSheet, onlyChargeable: boolean = false) => {
    const userTimesheet = timesheets.value.find(t => t.userId === user.user?.id)
    if (!userTimesheet) {
        return 0
    }
    let rows = userTimesheet.timeRows.filter(r => r.timeSpent).map(r => r.timeSpent)
    if (onlyChargeable) {
        const chargeableClientLabels = clientList.value.filter(c => c.chargeable).map(c => c.label)
        rows = userTimesheet.timeRows.filter(r => chargeableClientLabels.includes(r.client ?? '')).map(r => r.timeSpent)
    }
    const total = rows.reduce((acc, row) => {
        if (!acc) {
            acc = 0
        }
        if (!isNaN(Number(row))) {
            return acc + Number(row)
        }
    }, 0)
    return total
}

const getClientTotal = (client: Client) => {
    const total = timeGroupedByClient.value.find(t => t.label === client.label)?.value
    if (!total) {
        return ''
    }
    return daysDisplay.value ? (total / 7.7).toFixed(1) : total.toFixed(1)
}

const getChargeability = (user: UserTimeSheet) => {
    const totalClient = totalTimeSpentByUser(user, true)
    const total = totalTimeSpentByUser(user)
    if (!totalClient || !total) {
        return ''
    }
    return ((totalClient / total) * 100).toFixed(1) + '%'
}

const userDaysFilled = (user: UserTimeSheet) => {
    const userTimesheet = timesheets.value.find(t => t.userId === user.user?.id)
    if (!userTimesheet) {
        return 0
    }
    const rows = userTimesheet.timeRows.filter(r => r.type === 'work' && r.timeSpent === undefined && r.date && parseInt(r.date.slice(-5, -3)) <= new Date().getDate())
    return rows.length
}

const daysDisplay = ref(false)
</script>

<template>
    <section>
        <MonthBanner :monthAndYear="useDateFormat(currentDate, 'MMMM YYYY').value" @prevMonth="setPrevMonth"
            @nextMonth="setNextMonth"></MonthBanner>
        <section class="flex justify-center mt-8">
            <table>
                <thead>
                    <tr>
                        <th>
                            <UTooltip :text="daysDisplay ? 'View in hours' : 'View in days'">
                                <UToggle @click="daysDisplay = !daysDisplay" v-model="daysDisplay" on-icon="i-mdi-alpha-d"
                                    off-icon="i-mdi-alpha-h"
                                    :ui="{ inactive: 'bg-{color}-500 dark:bg-{color}-400', icon: { off: 'text-{color}-500 dark:text-{color}-400' } }" />
                            </UTooltip>
                        </th>
                        <th v-for="user in timesheets.filter(t => t.user?.firstName)" :key="user.id">{{
                            user.user?.firstName }}</th>
                        <th class="w-32">Total</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="client in clientList.filter(c => c.chargeable)" :key="client.id"
                        :class="`border-2 text-${getColorLabelFromCode(client.color ?? '')}-500`">
                        <td class="clientLabel">{{ client.label }}
                        </td>
                        <td v-for="user in timesheets.filter(t => t.user?.firstName)" :key="user.id">
                            {{ getTotalClientForUser(user, client, daysDisplay) }}
                        </td>
                        <td class="border-l-2 font-semibold">{{ getClientTotal(client) }}</td>
                    </tr>
                    <tr class="border-y-4 border-x-2">
                        <td class="clientLabel font-semibold">Total client</td>
                        <td v-for="userTimesheet in timesheets" :key="userTimesheet.id" class="font-semibold">
                            {{ daysDisplay ? ((totalTimeSpentByUser(userTimesheet, true) ?? 0) / 7.7).toFixed(1) :
                                totalTimeSpentByUser(userTimesheet, true)?.toFixed(1) }}
                        </td>
                        <td class="border-l-2 bg-gray-200"></td>
                    </tr>
                    <tr v-for="client in clientList.filter(c => !c.chargeable)" :key="client.id"
                        :class="`border-2 text-${getColorLabelFromCode(client.color ?? '')}-500`">
                        <td class="clientLabel">{{ client.label }}
                        </td>
                        <td v-for="user in timesheets.filter(t => t.user?.firstName)" :key="user.id">
                            {{ getTotalClientForUser(user, client, daysDisplay) }}
                        </td>
                        <td class="border-l-2 font-semibold">{{ getClientTotal(client) }}</td>
                    </tr>
                    <tr class="border-t-4 border-2">
                        <td class="clientLabel font-semibold">Total</td>
                        <td v-for="userTimesheet in timesheets" :key="userTimesheet.id" class="font-semibold">
                            {{ daysDisplay ? ((totalTimeSpentByUser(userTimesheet) ?? 0) / 7.7).toFixed(1) :
                                totalTimeSpentByUser(userTimesheet)?.toFixed(1) }}
                        </td>
                        <td class="border-l-2 bg-gray-200"></td>
                    </tr>
                    <tr class="border-2">
                        <td class="clientLabel font-semibold">Chargeability</td>
                        <td v-for="userTimesheet in timesheets" :key="userTimesheet.id" class="font-semibold">
                            {{ getChargeability(userTimesheet) }}
                        </td>
                        <td class="border-l-2 bg-gray-200"></td>
                    </tr>
                </tbody>
            </table>
        </section>
        <section class="flex flex-wrap gap-3 mt-8 justify-center">
            <div v-for="timesheet in timesheets">
                <WorkRepartition :categories="clientList" :rows="timesheet.timeRows"
                    :title="`${timesheet.user?.firstName} ${timesheet.user?.lastName?.substring(0, 1)}.`" />
            </div>
        </section>
        <section class="flex flex-col gap-3 mt-8 justify-center text-center">
            <div v-for="userTimesheet in timesheets">
                {{ userDaysFilled(userTimesheet) === 0 ? `${userTimesheet.user?.firstName} is up to date !` :
                    `${userTimesheet.user?.firstName} has not filled ${userDaysFilled(userTimesheet)} days yet.` }}

            </div>
        </section>
    </section>
</template>
<style lang="scss" scoped>
th,
tr {
    text-align: center;
    width: 80px;
}

.clientLabel {
    text-align: left;
    width: 150px;
    font-weight: 600;
}
</style>