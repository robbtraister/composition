'use strict'

import React from 'react'

const Site = ({ App, Styles }) => (
  <html>
    <head>
      <Styles />
    </head>
    <body>
      <App />
    </body>
  </html>
)

export default Site
