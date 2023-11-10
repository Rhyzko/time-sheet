export default function useAmp() {
    const goToAmpTicketList = (ticketList: string[]) => {
        const formattedList = ticketList.filter(ticket => ticket).join('%252C')
        window.open(`https://amp.service-now.com/now/nav/ui/classic/params/target/task_list.do%3Fsysparm_query%3Dsys_class_name%253Dincident%255EORsys_class_name%253Dsc_req_item%255EnumberIN${formattedList}%255EORDERBYnumber%26sysparm_first_row%3D1%26sysparm_view%3D`, '_blank')
    }

    const goToAmpTicket = (ticketNumber: string) => {
        window.open(`https://amp.service-now.com/nav_to.do?uri=/task_list.do?sysparm_query=sys_class_name=incident^ORsys_class_name=sc_req_item^number=${ticketNumber}^ORDERBYDESCsys_created_on&sysparm_first_row=1&sysparm_view=`, '_blank')
    }

    const createIncident = () => {
        window.open(`https://amp.service-now.com/nav_to.do?uri=%2Fcom.glideapp.servicecatalog_cat_item_view.do%3Fv%3D1%26sysparm_id%3D01588fa88712999033bb21f8dabb35aa%26sysparm_link_parent%3Dc767627f87b99594c0e931573cbb35ef%26sysparm_catalog%3D58a300344f2dcb0069a027201310c7ff%26sysparm_catalog_view%3Dcatalog_cms_internal%26sysparm_view%3Dcatalogs_default`, '_blank')
    }

    const createFeature = () => {
        window.open(`https://amp.service-now.com/nav_to.do?uri=%2Fcom.glideapp.servicecatalog_cat_item_view.do%3Fv%3D1%26sysparm_id%3D36683430c31ed9907bdb75d4e4013196%26sysparm_link_parent%3Dc767627f87b99594c0e931573cbb35ef%26sysparm_catalog%3D58a300344f2dcb0069a027201310c7ff%26sysparm_catalog_view%3Dcatalog_cms_internal%26sysparm_view%3D`, '_blank')
    }


    return {
        goToAmpTicketList,
        goToAmpTicket,
        createIncident,
        createFeature
    }
}