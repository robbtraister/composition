'use strict'

import React from 'react'
import { Redirect, Route, Switch } from 'react-router'

const GoHome = () => <Redirect to='/' />

const Home = () => <div />

const App = () => (
  <Switch>
    <Route path='/' exact component={Home} />
    <Route path='/' component={GoHome} />
  </Switch>
)

export default App
