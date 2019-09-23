export interface Props {
  initialContent?: string
  width?: string
  height?: string
  allowCookies?: boolean
  allowStyles?: boolean
  hidden?: boolean
  [key: string]: any
}

export const schema = {
  title: 'admin/editor.sandbox.title',
  description: 'admin/editor.sandbox.description',
  type: 'object',
  properties: {
    width: {
      title: 'admin/editor.sandbox.width.title',
      description: 'admin/editor.sandbox.width.description',
      type: 'string',
      default: null,
    },
    height: {
      title: 'admin/editor.sandbox.height.title',
      description: 'admin/editor.sandbox.height.description',
      type: 'string',
      default: null,
    },
    initialContent: {
      title: 'admin/editor.sandbox.initialContent.title',
      description: 'admin/editor.sandbox.initialContent.description',
      type: 'string',
      default: null,
    },
    allowCookies: {
      title: 'admin/editor.sandbox.allowCookies.title',
      description: 'admin/editor.sandbox.allowCookies.description',
      type: 'boolean',
      default: false,
    },
  },
}