import type { FieldAccess } from 'payload/types'

import type { Category, Product } from '../../../payload-types'
import { checkRole } from '../../Users/checkRole'

// Type guard to check if an object is a Category
const isCategoryObject = (category: string | Category): category is Category =>
  typeof category === 'object'

// We need to prevent access to documents behind a paywall
// To do this, we check the document against the user's list of active purchases
export const checkUserPurchases: FieldAccess<Product> = async ({ req: { user }, doc }) => {
  if (!user) {
    return false
  }

  if (checkRole(['admin'], user)) {
    return true
  }

  if (doc && user && typeof user === 'object' && user?.purchases?.length > 0) {
    const productCategories = doc.categories.map(category => {
      if (isCategoryObject(category)) {
        return category.id
      }
      return category
    })

    const userPurchasedCategories = user.purchases
      .filter(purchase => isCategoryObject(purchase) && purchase.id)
      .map(purchase => purchase.id)

    // Check if there's at least one purchase for each category
    const hasPurchasedAllCategories = productCategories.every(id =>
      // eslint-disable-next-line prettier/prettier
      userPurchasedCategories.includes(id),)

    if (!hasPurchasedAllCategories) {
      // Return a message indicating that the user needs to pick at least one product from each category
      throw new Error(
        'Please pick at least one product from each category before making a payment.',
      )
    }

    return true
  }

  return false
}
