import type { AfterChangeHook } from 'payload/dist/collections/config/types'

import type { Order } from '../../../payload-types'

export const capOrderPerDay: AfterChangeHook<Order> = async ({ doc, req, operation }) => {
  const { payload, user } = req

  // Specify the daily order limit
  const dailyOrderLimit = 10

  if (operation === 'create' && doc.orderedBy && user) {
    const orderedBy = typeof doc.orderedBy === 'string' ? doc.orderedBy : doc.orderedBy.id

    // Check if the user has reached the daily order limit
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const whereCondition: { [key: string]: unknown } = {
      orderedBy: { $eq: orderedBy },
      createdAt: { $gte: today.getTime() },
    }

    const result = await payload.find({
      collection: 'orders',
      where: whereCondition,
    })

    // Access the 'docs' property to get the actual array of documents
    const userOrders = result.docs || []

    // If the user has reached the daily order limit (e.g., 10), reject the order
    if (userOrders.length >= dailyOrderLimit) {
      throw new Error(
        `Daily order limit reached. You cannot place more than ${dailyOrderLimit} orders today.`,
      )
    }
  }
}
