'use strict'

import path from 'path'

import React from 'react'
import ReactDOM from 'react-dom/server'
import { StaticRouter } from 'react-router'
import { ServerStyleSheet } from 'styled-components'

import { Redirect } from '../errors'
import { readFile } from '../utils/promises'

import App from '~/src/views/app'
import Site from '~/src/views/site'
// import Store from './store'

const Store = ({ user, location }) => ({})

const StyledComponents = 'styled-components'
const STYLED_COMPONENTS_PATTERN = new RegExp(
  `<${StyledComponents}></${StyledComponents}>`,
  'g'
)

interface AppProps {
  appId?: string
  static?: boolean
}
interface ScriptProps {
  name: string
}
interface StylesProps {
  inline?: boolean
}
interface StyleProps {
  name: string
}

const Script = ({ name }: ScriptProps) => (
  <script type="text/javascript" src={`/dist/${name}.js`} defer />
)

const polyfills = {
  assign: '(window.Object&&window.Object.assign)',
  fetch: 'window.fetch',
  includes: 'Array.prototype.includes',
  map: 'window.Map',
  promise: 'window.Promise',
  set: 'window.Set'
}

export default async function renderSite({
  appId,
  appTitle,
  location,
  projectRoot,
  user
}: {
  appId: string
  appTitle?: string
  location: string
  projectRoot: string
  user?: object
}) {
  const app = user ? 'app' : 'www'
  const context: { url?: string } = {}

  const promises = []

  const store = Store({ user, location })

  const Libs = () => (
    <>
      <script
        type="text/javascript"
        dangerouslySetInnerHTML={{
          __html:
            // Object.keys(polyfills)
            //   .map(
            //     polyfill =>
            //       `if(!${
            //         polyfills[polyfill]
            //       })document.write('<script type="text/javascript" src="/dist/polyfills/${polyfill}.js" defer=""><\\/script>');`
            //   )
            //   .join('')
            `if(!(${Object.values(polyfills).join(
              '&&'
            )}))document.write('<script type="text/javascript" src="/dist/polyfills.js" defer=""><\\/script>');`
        }}
      />
      <Script name="runtime" />
      <Script name="vendors" />
      <Script name={app} />
      {user && (
        <script type="text/javascript" src="/auth/user?jsonp=setUser" defer />
      )}
    </>
  )

  const styles = {}
  const Styles = ({ inline, ...props }: StylesProps) => {
    const Style = inline
      ? function Style({ name }: StyleProps) {
          if (name in styles) {
            return styles[name]
          }
          promises.push(
            readFile(path.join(projectRoot, 'build', 'dist', `${name}.css`))
              .then(data => {
                styles[name] = (
                  <style
                    {...props}
                    dangerouslySetInnerHTML={{ __html: data }}
                  />
                )
              })
              .catch(() => {
                styles[name] = null
              })
          )
          return null
        }
      : function Style({ name }: StyleProps) {
          return <link {...props} href={`/dist/${name}.css`} rel="stylesheet" />
        }

    return (
      <>
        <Style name="site" />
        <Style name={app} />
        <StyledComponents />
      </>
    )
  }

  const AppWrapper = ({
    appId: propId,
    static: isStatic,
    ...props
  }: AppProps) => (
    <>
      {!isStatic && <Libs />}
      <div id={propId || appId}>
        <StaticRouter context={context} location={location}>
          <App {...props} user={user} store={store} />
        </StaticRouter>
      </div>
      {!isStatic && (
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `window.__DATA__=${JSON.stringify({ store })}`
          }}
        />
      )}
    </>
  )

  const props = {
    title: appTitle,
    App: AppWrapper,
    Styles
  }

  const sheet = new ServerStyleSheet()
  function renderHTML() {
    return ReactDOM.renderToStaticMarkup(
      sheet.collectStyles(<Site {...props} />)
    )
  }

  async function renderAsync() {
    let html = renderHTML()

    if (promises.length) {
      await Promise.all(promises)
      html = renderHTML()
    }

    return html
  }

  try {
    const html: string = await renderAsync()

    if (context.url) {
      throw new Redirect(context.url)
    }

    return `<!DOCTYPE html>${html.replace(
      STYLED_COMPONENTS_PATTERN,
      sheet.getStyleTags()
    )}`
  } finally {
    sheet.seal()
  }
}
