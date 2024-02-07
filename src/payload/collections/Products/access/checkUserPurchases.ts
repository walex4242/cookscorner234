/* eslint-disable prettier/prettier */
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
    // Check if the user has purchased at least one product from each category
    const productCategories = doc.categories.map(category => {
      // Use type guard to check if it's an object
      if (isCategoryObject(category)) {
        return category.id.toString()
      }
      return category
    })

    const userPurchasedCategories = user.purchases
      .filter(purchase => isCategoryObject(purchase) && purchase.id)
      .map(purchase => purchase.id.toString())

    const hasPurchasedAllCategories = productCategories.every(id =>
      userPurchasedCategories.includes(id),)

    return hasPurchasedAllCategories
  }

  return false
}
