import React, { Component } from 'react'
import { NoSSR, canUseDOM } from 'vtex.render-runtime'
import stringify from 'safe-json-stringify'
import { schema, Props } from './modules/schema'

// Avoid breaking SSR by loading this only in the client side
let iFrameResizer: any = null
if (canUseDOM) {
  iFrameResizer = require('iframe-resizer/js/iframeResizer')
}

interface StyleContainer {
  href?: string
  rules?: string
}

interface IframeOptions {
  cookieEventType: string
  propsEventType: string
  cookie: string
  styles: StyleContainer[]
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
        styles.push({rules: Array.prototype.map.call(stylesheet.rules, (r: any) => r.cssText).join('\n') as string })
      }
    }
  }
  return styles
}

const appId = process.env.VTEX_APP_ID
const cookieEventType = `${appId}:iframeCookieSet`
const propsEventType = `${appId}:props`

if (canUseDOM) {
  window.addEventListener('message', function(event: MessageEvent) {
    if (event.data && event.data.type === cookieEventType) {
      document.cookie = event.data.value
    }
  })
}

function initIframe (options: IframeOptions) {
  const {styles, cookie, cookieEventType, propsEventType} = options

  // Mount cookie
  if (cookie) {
    (window as any).__cookie = cookie
    Object.defineProperty(document, 'cookie', {
      get: () => (window as any).__cookie,
      set: (value: string) => {
        if (!value) {
          return
        }
        const clean = value.split(';')[0];
        (window as any).__cookie = `${clean}; ` + (window as any).__cookie
        window.parent.postMessage({type: cookieEventType, value}, '*')
      },
    })
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
        sheet.innerHTML = style.rules
        document.head.appendChild(sheet)
      }
    })
  }

  window.addEventListener('message', function(event: MessageEvent) {
    // Add props to window
    if (event.data && event.data.type === propsEventType) {
      (window as any).props = JSON.parse(event.data.props)
    }
  })
}

class Sandbox extends Component<Props> {
  public iframeRef: HTMLIFrameElement | null = null

  private injectedDocument: string = ''
  static schema: object;

  public constructor(props: Props) {
    super(props)
    
    const { initialContent, allowCookies, allowStyles: allowStylesProp } = props
    const allowStyles = allowStylesProp === undefined ? true : allowStylesProp
    
    if (!canUseDOM) {
      return
    }
    
    const cookie = allowCookies && document.cookie
    const styles = allowStyles && getExistingStyles()
    this.injectedDocument = `<html><head><script>window.props=${
      this.safeProps
    };(${
      initIframe.toString()
    })(${
      stringify({cookieEventType, propsEventType, styles, cookie})
    });</script><script type="text/javascript" src="https://unpkg.com/iframe-resizer@4.1.1/js/iframeResizer.contentWindow.js"></script></head><body>${initialContent}</body></html>`
  }

  public componentDidMount() {
    this.updateIframe()
  }

  public componentDidUpdate() {
    this.updateIframe()
  }

  setRef = (element: HTMLIFrameElement | null) => {
    if (!element) {
      return
    }

    this.iframeRef = element
    iFrameResizer({
      checkOrigin: false,
    }, this.iframeRef)
  }

  public render() {
    const { width = '100%', height, hidden } = this.props
    return (
      <NoSSR>
        <iframe
          ref={this.setRef}
          frameBorder={0}
          style={hidden ? {display: 'none'} : {width, height}}
          sandbox="allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation"
          className="vtex-sandbox-iframe"
          hidden={hidden}
          src={`data:text/html;charset=UTF-8,${encodeURIComponent(this.injectedDocument)}`}>
        </iframe>
      </NoSSR>
    )
  }

  private get safeProps () {
    // We don't use this vars because we are interested in the `rest`
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {runtime, iframeRef, initialContent, allowCookies, height, width, treePath, ...rest} = this.props as any
    return stringify(rest)
  }

  private updateIframe() {
    if (this.iframeRef && this.iframeRef.contentWindow) {
      const props = this.safeProps
      this.iframeRef.contentWindow.postMessage({type: propsEventType, props}, '*')
    }
  }
}

Sandbox.schema = schema

export default Sandbox