import React from 'react'
import { Props, schema } from './modules/schema'
import { useOrderForm } from 'vtex.store-resources/OrderFormContext'
import Sandbox from './Sandbox'

const SandboxOrder: StorefrontFunctionComponent<Props> = ({
  initialContent,
  width,
  height,
  allowCookies,
  allowStyles,
  hidden,
}) => {
  const orderForm = useOrderForm()

  return (
    <Sandbox
      orderForm={orderForm}
      initialContent={initialContent}
      width={width}
      height={height}
      allowCookies={allowCookies}
      allowStyles={allowStyles}
      hidden={hidden} />
  )
}

SandboxOrder.schema = schema

export default SandboxOrder