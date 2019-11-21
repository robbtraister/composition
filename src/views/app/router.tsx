'use strict'

/* global __PRIVATE_APP__ */

import React from 'react'
import { Redirect, Route, Switch } from 'react-router'

import { Home } from './scenes/home'
import { Login } from './scenes/login'
import { useUser } from './contexts/user'

const Welcome = () => <div>welcome</div>
const GoWelcome = () => <Redirect to="/welcome" />
const GoDashboard = () => <Redirect to="/dashboard" />

const Router = () => {
  const user = useUser()

  return (
    <Switch>
      <Route path="/welcome" component={Welcome} />
      <Route
        path="/dashboard"
        component={__PRIVATE_APP__ && user ? Home : Login}
      />
      <Route
        path="/"
        component={__PRIVATE_APP__ && user ? GoDashboard : GoWelcome}
      />
    </Switch>
  )
}

export default Router
