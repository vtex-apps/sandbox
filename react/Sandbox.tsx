import React, { RefObject, PureComponent, createRef } from 'react'
import { NoSSR, canUseDOM } from 'vtex.render-runtime'
import stringify from 'safe-json-stringify'

interface StyleContainer {
  href?: string
  rules?: string
}

interface IframeOptions {
  cookieEventType: string
  cookie: string
  styles: StyleContainer[]
}

interface Props {
  initialContent?: string
  width?: string
  height?: string
  allowCookies?: boolean
  allowStyles?: boolean
  iframeRef?: RefObject<HTMLIFrameElement>
  hidden?: boolean
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
const type = `${appId}:iframeCookieSet`

if (canUseDOM) {
  window.addEventListener('message', function(event: MessageEvent) {
    if (event.data && event.data.type === type) {
      document.cookie = event.data.value
    }
  })
}

function initIframe (options: IframeOptions) {
  const {styles, cookie, cookieEventType} = options

  // Mount cookie
  if (cookie) {
    (window as any).__cookie = cookie
    Object.defineProperty(document, 'cookie', {
      get: () => (window as any).__cookie,
      set: (value: string) => {
        if (!value) {
          return
        }
        const [clean] = value.split(';');
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
    const {props} = event.data
    // Add props to window
    if (props) {
      (window as any).props = JSON.parse(props)
    }
  })
}

export default class Sandbox extends PureComponent<Props> {
  public iframeRef: RefObject<HTMLIFrameElement>

  public schema = {
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
      initialContent: {
        title: 'editor.sandbox.initialContent.title',
        description: 'editor.sandbox.initialContent.description',
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

  private injectedDocument: string = ''

  public constructor(props: Props) {
    super(props)
    
    const { initialContent, allowCookies, allowStyles: allowStylesProp } = props
    const allowStyles = allowStylesProp === undefined ? true : allowStylesProp
    this.iframeRef = props.iframeRef || createRef<HTMLIFrameElement>()
    
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
      stringify({cookieEventType: type, styles, cookie})
    });</script></head><body>${initialContent}</body></html>`
  }

  public componentDidMount() {
    this.updateIframe()
  }

  public componentDidUpdate() {
    this.updateIframe()
  }

  public render() {
    const { width = '100%', height, hidden } = this.props
    return (
      <NoSSR>
        <iframe
          ref={this.iframeRef}
          frameBorder={0}
          style={hidden ? {display: 'none'} : {width, height}}
          sandbox="allow-scripts"
          className="vtex-sandbox-iframe"
          hidden={hidden}
          src={`data:text/html,${encodeURIComponent(this.injectedDocument)}`}>
        </iframe>
      </NoSSR>
    )
  }

  private get safeProps () {
    const {runtime, iframeRef, initialContent, allowCookies, height, width, treePath, ...rest} = this.props as any
    return stringify(rest)
  }

  private updateIframe() {
    const ref = this.iframeRef
    if (ref.current && ref.current.contentWindow) {
      const props = this.safeProps
      ref.current.contentWindow.postMessage({props}, '*')
    }
  }
}
