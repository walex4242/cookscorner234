const policies = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'",
    "'unsafe-eval'",
    'https://checkout.stripe.com',
    'https://js.stripe.com',
    'https://maps.googleapis.com',
    'https://cookscornernc.com',
    'https://cookscorner.payloadcms.app/',
  ],
  'child-src': ["'self'"],
  'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
  'img-src': [
    "'self'",
    'https://*.stripe.com',
    'https://raw.githubusercontent.com',
    'https://cookscornernc.com',
    'https://cookscorner.payloadcms.app/',
  ],
  'font-src': ["'self'"],
  'frame-src': [
    "'self'",
    'https://checkout.stripe.com',
    'https://js.stripe.com',
    'https://hooks.stripe.com',
    'https://cookscornernc.com',
    'https://cookscorner.payloadcms.app/',
  ],
  'connect-src': [
    "'self'",
    'https://checkout.stripe.com',
    'https://api.stripe.com',
    'https://maps.googleapis.com',
    'https://cookscornernc.com',
    'https://cookscorner.payloadcms.app/',
  ],
}

module.exports = Object.entries(policies)
  .map(([key, value]) => {
    if (Array.isArray(value)) {
      return `${key} ${value.join(' ')}`
    }
    return ''
  })
  .join('; ')
