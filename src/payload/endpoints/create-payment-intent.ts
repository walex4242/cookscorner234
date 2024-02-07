/* eslint-disable function-paren-newline */
/* eslint-disable prettier/prettier */
import type { PayloadHandler } from 'payload/config'
import Stripe from 'stripe'

import type { CartItems, Product } from '../payload-types'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2022-08-01',
})

export const createPaymentIntent: PayloadHandler = async (req, res): Promise<void> => {
  const { user, payload } = req

  if (!user) {
    res.status(401).send('Unauthorized')
    return
  }

  const fullUser = await payload.findByID({
    collection: 'users',
    id: user?.id,
  })

  if (!fullUser) {
    res.status(404).json({ error: 'User not found' })
    return
  }

  try {
    let stripeCustomerID = fullUser?.stripeCustomerID

    // lookup user in Stripe and create one if not found
    if (!stripeCustomerID) {
      const customer = await stripe.customers.create({
        email: fullUser?.email,
        name: fullUser?.name,
      })

      stripeCustomerID = customer.id

      await payload.update({
        collection: 'users',
        id: user?.id,
        data: {
          stripeCustomerID,
        },
      })
    }

    let total = 0

    const hasItems = fullUser?.cart?.items?.length > 0

    if (!hasItems) {
      throw new Error('No items in cart')
    }

    const categoriesWithSelectedProducts: Set<string> = new Set()

    // ...

    await Promise.all(
      fullUser?.cart?.items?.map(async (item: CartItems[0]): Promise<null> => {
        const { product, quantity } = item

        if (!quantity) {
          return null
        }

        if (typeof product === 'string') {
          const productDoc = await payload.findByID({
            collection: 'products',
            id: product,
          })

          if (productDoc?.categories && productDoc.categories.length > 0) {
            productDoc.categories.forEach(category => {
              if (typeof category === 'string') {
                categoriesWithSelectedProducts.add(category)
              } else {
                categoriesWithSelectedProducts.add(category.id.toString())
              }
            })
          }
        } else if (product?.stripeProductID) {
          // Handle the case where product is a Product
          const prices = await stripe.prices.list({
            product: product.stripeProductID,
            limit: 100,
            expand: ['data.product'],
          })

          if (prices.data.length === 0) {
            res.status(404).json({ error: 'There are no items in your cart to checkout with' })
            return null
          }

          const price = prices.data[0]
          total += price.unit_amount * quantity

          // Track the categories with selected products
          if (product.categories && product.categories.length > 0) {
            product.categories.forEach(category => {
              if (typeof category === 'string') {
                categoriesWithSelectedProducts.add(category)
              } else {
                categoriesWithSelectedProducts.add(category.id.toString())
              }
            })
          }
        }

        return null
      }),
    )
    // Ensure that at least one product is selected from each category

    const allCategories = fullUser?.cart?.items
      .flatMap(item =>
        typeof item.product === 'string' ? [] : ((item.product?.categories || []) as string[]),
      )
      .filter((category, index, array) => array.indexOf(category) === index)

    // const isProduct = (product: string | Product): product is Product => {
    //   return typeof product !== 'string' && 'categories' in product
    // }

    // ...

    const categoriesSelectedInCart = fullUser?.cart?.items
      .filter(item => typeof item.product !== 'string' && item.product?.categories)
      .flatMap(item => (item.product as Product)?.categories || []) // Use type assertion here
      .filter((category, index, array) => array.indexOf(category) === index)

    // ...

    const isAllCategoriesSelected = allCategories.every(category =>
      categoriesSelectedInCart.includes(category),
    )

    if (!isAllCategoriesSelected) {
      throw new Error(
        'Please pick at least one product from each category before making a payment.',
      )
    }

    if (total === 0) {
      throw new Error('There is nothing to pay for, add some items to your cart and try again.')
    }

    const paymentIntent = await stripe.paymentIntents.create({
      customer: stripeCustomerID,
      amount: total,
      currency: 'usd',
      payment_method_types: ['card'],
    })

    res.send({ client_secret: paymentIntent.client_secret })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    payload.logger.error(message)
    res.status(400).json({ error: message })
  }
}
