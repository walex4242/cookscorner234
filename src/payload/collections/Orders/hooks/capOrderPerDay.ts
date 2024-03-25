import type { BeforeChangeHook } from 'payload/dist/collections/config/types'
import APIError from 'payload/dist/errors/APIError'

import type { Order } from '../../../payload-types'

class MyError extends APIError {
  constructor(message: string) {
    super(message, 400, undefined, true)
  }
}

export const capOrderPerDay: BeforeChangeHook<Order> = async ({
  data,
  req,
  operation,
  originalDoc,
}) => {
  const { payload } = req

  const BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL
  const totalMealCapRequest = await fetch(`${BASE_URL}/api/globals/mealcap`)
  const response = await totalMealCapRequest.json()
  const totalMeapcap = response?.totalMealCap

  if (operation == 'create') {
    var today = new Date()
    today.setHours(0, 0, 0, 0)

    const result = await payload.find({
      collection: 'orders',
      where: {
        createdAt: {
          greater_than_equal: today.toISOString(),
        },
      },
    })

    // check if the user has reached the daily limit
    if (result.totalDocs >= totalMeapcap) {
      throw new MyError(
        `Daily order limit reached. You cannot place more than ${totalMeapcap} orders today.`,
      )
    }
  }

  return
}
