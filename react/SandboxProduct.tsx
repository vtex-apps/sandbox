import React from 'react'
import { useProduct } from 'vtex.product-context'
import { Props, schema } from './modules/schema'
import Sandbox from './Sandbox'

const SandboxProduct: StorefrontFunctionComponent<Props> = ({
  initialContent,
  width,
  height,
  allowCookies,
  allowStyles,
  hidden,
}) => {
  const productContext = useProduct()

  return (
    <Sandbox
      {...productContext}
      initialContent={initialContent}
      width={width}
      height={height}
      allowCookies={allowCookies}
      allowStyles={allowStyles}
      hidden={hidden} />
  )
}

SandboxProduct.schema = schema

export default SandboxProduct