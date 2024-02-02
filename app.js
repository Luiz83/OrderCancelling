const axios = require('axios');
const moment = require('moment')

const instance = axios.create({
    baseURL: "https://api.tiendanube.com/v1/2562909",
    headers: {
        "Authentication": "bearer 32a422ec2180e287247b117f0f9fba9ef7d5756a",
        "User-Agent": "lopachioni@gmail.com"
    }
})

Main()

async function Main() {
    let orders = await GetAllOrders()
    const refusedOrders = await GetRefusedOrder(orders)
    await CancellAllRefusedOrders(refusedOrders)
}


async function GetAllOrders() {
    const response = await instance.get("/orders?per_page=200")
    console.log(response.status)
    return response.data
}

async function GetRefusedOrder(orders) {
    const refusedOrders = []
    let dateNow = moment().toISOString()
    orders.forEach(order => {
        const diffMinutes = moment(dateNow).diff(order.updated_at, 'minutes')
        if (order.status == "open" && order.payment_status == "voided" && diffMinutes >= 5)
            refusedOrders.push(order)
    })
    return refusedOrders
}

async function CancellAllRefusedOrders(refusedOrders) {
    refusedOrders.forEach(async (order) => {
        await CancellOrder(order.id)
    })
}

async function CancellOrder(id) {
    await instance.post(`/orders/${id}/cancel`, {
        "reason": "other"
    })
    console.log(`Um pedido foi cancelados as ${moment().toLocaleString()}`)
}


