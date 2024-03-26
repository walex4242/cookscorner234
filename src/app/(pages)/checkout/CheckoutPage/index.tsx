'use client'

import React, { Fragment, useEffect, useMemo } from 'react'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { Category, Product, Settings } from '../../../../payload/payload-types'
import { Button } from '../../../_components/Button'
import { LoadingShimmer } from '../../../_components/LoadingShimmer'
import { useAuth } from '../../../_providers/Auth'
import { useCart } from '../../../_providers/Cart'
import { useTheme } from '../../../_providers/Theme'
import cssVariables from '../../../cssVariables'
import { CheckoutForm } from '../CheckoutForm'
import { CheckoutItem } from '../CheckoutItem'

import classes from './index.module.scss'

const apiKey = `${process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}`
const stripe = loadStripe(apiKey)

export const CheckoutPage: React.FC<{
  settings: Settings
}> = props => {
  const {
    settings: { productsPage },
  } = props

  const { user } = useAuth()
  const router = useRouter()
  const [error, setError] = React.useState<string | null>(null)
  const [allCategoriesSelected, setAllCategoriesSelected] = React.useState<boolean>(false)
  const [clientSecret, setClientSecret] = React.useState()
  const hasMadePaymentIntent = React.useRef(false)
  const { theme } = useTheme()

  const { cart, cartIsEmpty, cartTotal } = useCart()

  useEffect(() => {
    if (user !== null && cartIsEmpty) {
      router.push('/cart')
    }
  }, [router, user, cartIsEmpty])

  // utility functions
  const getProductById = async (productId: string): Promise<Product> => {
    const request = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/products/${productId}`)
    const product = await request.json()
    return product
  }

  const getAllCategories = async (): Promise<Category[]> => {
    const request = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/categories`)

    const categories = await request.json()

    return categories
  }

  const validateCategoriesInCart = async (): Promise<boolean> => {
    const categoriesFound: Set<string> = new Set()

    for (const cartItem of cart.items) {
      // @ts-ignore
      const product: any = await getProductById(cartItem.product?.id as string)

      if (product) {
        categoriesFound.add(product.categories[0]?.id as string)
      }
    }

    const allCategories = await getAllCategories()
    // @ts-ignore
    const hasAllCategories = allCategories?.docs.every(category => categoriesFound.has(category.id))

    return hasAllCategories
  }

  useEffect(() => {
    if (user && cart && hasMadePaymentIntent.current === false) {
      hasMadePaymentIntent.current = true

      const makeIntent = async () => {
        try {
          const paymentReq = await fetch(
            `${process.env.NEXT_PUBLIC_SERVER_URL}/api/create-payment-intent`,
            {
              method: 'POST',
              credentials: 'include',
            },
          )

          const res = await paymentReq.json()

          if (res.error) {
            setError(res.error)
          } else if (res.client_secret) {
            setError(null)
            setClientSecret(res.client_secret)
          }
        } catch (e) {
          setError('Something went wrong.')
        }
      }

      makeIntent()

      const updateCategoriesSelected = async () => {
        const categoriesSelected = await validateCategoriesInCart()
        setAllCategoriesSelected(categoriesSelected)
        //console.log('allCategoriesSelected:', categoriesSelected)
      }

      updateCategoriesSelected()
    }
  }, [user, cart])

  if (!user || !stripe) return null

  useMemo(async () => {
    const categoriesSelected = await validateCategoriesInCart()
    setAllCategoriesSelected(categoriesSelected)
  }, [user, cart])

  return (
    <Fragment>
      {cartIsEmpty && (
        <div>
          {'Your '}
          <Link href="/cart">cart</Link>
          {' is empty.'}
          {typeof productsPage === 'object' && productsPage?.slug && (
            <Fragment>
              {' '}
              <Link href={`/${productsPage.slug}`}>Continue shopping?</Link>
            </Fragment>
          )}
        </div>
      )}

      {!cartIsEmpty && (
        <div className={classes.items}>
          <div className={classes.header}>
            <p>Products</p>
            <div className={classes.headerItemDetails}>
              <p></p>
              <p className={classes.quantity}>Quantity</p>
            </div>
            <p className={classes.subtotal}>Subtotal</p>
          </div>

          <ul>
            {cart?.items?.map((item, index) => {
              if (typeof item.product === 'object') {
                const {
                  quantity,
                  product,
                  product: { title, meta },
                } = item

                if (!quantity) return null

                const metaImage = meta?.image

                return (
                  <Fragment key={index}>
                    <CheckoutItem
                      product={product}
                      title={title}
                      metaImage={metaImage}
                      quantity={quantity}
                      index={index}
                    />
                  </Fragment>
                )
              }
              return null
            })}
            <div className={classes.orderTotal}>
              <p>Order Total</p>
              <p>{cartTotal.formatted}</p>
            </div>
          </ul>
        </div>
      )}

      {/* Show loading indicator while validating categories */}
      {!allCategoriesSelected && !clientSecret && (
        <div className={classes.loading}>
          <LoadingShimmer number={2} />
        </div>
      )}

      {!allCategoriesSelected && clientSecret && (
        <div className={classes.error}>
          <h3>Error</h3>
          <p>{`You must select at 1 meal from all categories`}</p>
          <br />
          <Button label="Continue shopping" href="/products" appearance="primary" />
        </div>
      )}

      {!clientSecret && !error && (
        <div className={classes.loading}>
          <LoadingShimmer number={2} />
        </div>
      )}
      {!clientSecret && error && (
        <div className={classes.error}>
          <p>{`Error: ${error}`}</p>
          <Button label="Back to cart" href="/cart" appearance="secondary" />
        </div>
      )}
      {allCategoriesSelected && clientSecret && (
        <Fragment>
          <h3 className={classes.payment}>Payment Details</h3>
          {error && <p>{`Error: ${error}`}</p>}
          <Elements
            stripe={stripe}
            options={{
              clientSecret,
              appearance: {
                theme: 'stripe',
                variables: {
                  colorText:
                    theme === 'dark' ? cssVariables.colors.base0 : cssVariables.colors.base1000,
                  fontSizeBase: '16px',
                  fontWeightNormal: '500',
                  fontWeightBold: '600',
                  colorBackground:
                    theme === 'dark' ? cssVariables.colors.base850 : cssVariables.colors.base0,
                  fontFamily: 'Inter, sans-serif',
                  colorTextPlaceholder: cssVariables.colors.base500,
                  colorIcon:
                    theme === 'dark' ? cssVariables.colors.base0 : cssVariables.colors.base1000,
                  borderRadius: '0px',
                  colorDanger: cssVariables.colors.error500,
                  colorDangerText: cssVariables.colors.error500,
                },
              },
            }}
          >
            <CheckoutForm />
          </Elements>
        </Fragment>
      )}
    </Fragment>
  )
}
