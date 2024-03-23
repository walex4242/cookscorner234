import type { GlobalConfig } from 'payload/types'

export const MealCap: GlobalConfig = {
  slug: 'mealcap',
  access: {
    read: () => true,
  },

  fields: [
    {
      name: 'totalMealCap',
      type: 'number',
      required: true,
      label: 'Total meal cap',
      min: 0,
    },
  ],
}
