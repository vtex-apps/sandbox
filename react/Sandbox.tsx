import React, { useEffect, useRef } from 'react'
import { NoSSR, canUseDOM } from 'vtex.render-runtime'
import stringify from 'safe-json-stringify'

interface StyleContainer {
  href?: string
  rules?: string[]
}

interface IframeOptions {
  allowCookies: boolean,
  cookieEventType: string,
}

// Create objects representing styles, either with href or the actual rules, to be passed to the iframe.
function getExistingStyles() {
  const styles: StyleContainer[] = []
  for (let i = 0; i < document.styleSheets.length; i++) {
    const stylesheet: any = document.styleSheets.item(i)
    if (stylesheet !== null) {
      if (stylesheet.href) {
        styles.push({href: stylesheet.href})
      } else {
        styles.push({rules: Array.prototype.map.call(stylesheet.rules, (r: any) => r.cssText) as string[] })
      }
    }
  }
  return styles
}

const appId = process.env.VTEX_APP_ID
const type = `${appId}:iframeCookieSet`

if (canUseDOM) {
  window.addEventListener('message', function(event: MessageEvent) {
    if (event.data && event.data.type === type) {
      document.cookie = event.data.value
    }
  })
}

function init (options: IframeOptions) {
  let contentInitialized = false

  if (options.allowCookies) {
    Object.defineProperty(document, 'cookie', {
      get: () => (window as any).__cookie,
      set: (value: string) => {
        if (!value) {
          return
        }
        const [clean] = value.split(';');
        (window as any).__cookie = `${clean}; ` + (window as any).__cookie
        window.parent.postMessage({type: options.cookieEventType, value}, '*')
      },
    })
  }

  window.addEventListener('message', function(event: MessageEvent) {
    const {styles, props, content, cookie} = event.data
    // Add props to window
    if (props) {
      (window as any).props = JSON.parse(props)
    }
    // Mount cookie
    if (options.allowCookies && cookie) {
      (window as any).__cookie = cookie
    }
    // Mount block content
    if (content && !contentInitialized) {
      contentInitialized = true
      document.write(content)
    }
    // Add styles
    if (styles && Array.isArray(styles)) {
      styles.forEach((style: StyleContainer) => {
        if (style.href) {
          const link = document.createElement('link')
          link.href = style.href
          link.type = 'text/css'
          link.rel = 'stylesheet'
          document.head.appendChild(link)
        } else if (style.rules) {
          const sheet = document.createElement('style')
          sheet.innerHTML = style.rules.join('\n')
          document.head.appendChild(sheet)
        }
      })
    }
  })
}

const Sandbox: StorefrontFunctionComponent<SandboxProps> = ({ content, width = '100%', height, allowCookies, allowStyles, ...props }) => {
  delete (props as any).runtime
  const injected = encodeURIComponent(`<script>${init.toString()};init(${stringify({allowCookies, cookieEventType: type})});</script>`)
  const iframeEl = useRef<HTMLIFrameElement>(null)

  if (allowStyles === undefined) {
    allowStyles = true
  }

  useEffect(() => {
    if (iframeEl.current && iframeEl.current.contentWindow) {
      const styles = allowStyles && getExistingStyles()
      const safeProps = stringify(props)
      const cookie = allowCookies && document.cookie
      iframeEl.current.contentWindow.postMessage({props: safeProps, content, styles, cookie}, '*')
    }
  })

  return (
    <NoSSR>
      <iframe
        ref={iframeEl}
        frameBorder={0}
        style={{width, height}}
        sandbox="allow-scripts"
        className="vtex-sandbox-iframe"
        src={"data:text/html,"+injected}>
      </iframe>
    </NoSSR>
  )
}

interface SandboxProps {
  content?: string
  width?: string
  height?: string
  allowCookies?: boolean
  allowStyles?: boolean
}

Sandbox.schema = {
  title: 'editor.sandbox.title',
  description: 'editor.sandbox.description',
  type: 'object',
  properties: {
    width: {
      title: 'editor.sandbox.width.title',
      description: 'editor.sandbox.width.description',
      type: 'string',
      default: null,
    },
    height: {
      title: 'editor.sandbox.height.title',
      description: 'editor.sandbox.height.description',
      type: 'string',
      default: null,
    },
    content: {
      title: 'editor.sandbox.content.title',
      description: 'editor.sandbox.content.description',
      type: 'string',
      default: null,
    },
    allowCookies: {
      title: 'editor.sandbox.allowCookies.title',
      description: 'editor.sandbox.allowCookies.description',
      type: 'boolean',
      default: false,
    },
  },
}

export default Sandbox
