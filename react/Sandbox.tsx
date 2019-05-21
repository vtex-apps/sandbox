import React from 'react'
import { NoSSR } from 'vtex.render-runtime'
import stringify from 'safe-json-stringify'

const Sandbox: StorefrontFunctionComponent<SandboxProps> = ({ content, width = '100%', height, ...props }) => {
  delete (props as any).runtime
  const propsScript = `<script>window.props = ${stringify(props)}</script>`
  const injected = encodeURIComponent(propsScript + content)
  return (
    <NoSSR>
      <iframe frameBorder={0} style={{width, height}} sandbox="allow-scripts" className="vtex-sandbox-iframe" src={"data:text/html,"+injected} >
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
