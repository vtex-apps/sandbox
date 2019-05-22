import React, { useEffect, useRef } from 'react'
import { NoSSR } from 'vtex.render-runtime'
import stringify from 'safe-json-stringify'

interface StyleContainer {
  href?: string
  rules?: string[]
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

function init () {
  let contentInitialized = false

  Object.defineProperty(document, 'cookie', {
    get: () => (window as any).__cookie,
    set: (value: string) => {
      window.parent.postMessage({type: 'iframeCookieSet', value}, '*')
    },
  })

  window.addEventListener('message', function(event: MessageEvent) {
    const {styles, props, content, cookie} = event.data
    // Add props to window
    if (props) {
      (window as any).props = JSON.parse(props)
    }
    // Mount cookie
    if (cookie) {
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

const Sandbox: StorefrontFunctionComponent<SandboxProps> = ({ content, width = '100%', height, ...props }) => {
  delete (props as any).runtime
  const injected = encodeURIComponent(`<script>${init.toString()};init();</script>`)
  const iframeEl = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (iframeEl.current && iframeEl.current.contentWindow) {
      const styles = getExistingStyles()
      const safeProps = stringify(props)
      const cookie = document.cookie
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
  },
}

export default Sandbox
