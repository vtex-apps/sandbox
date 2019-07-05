declare module 'vtex.product-context' {
  interface ProductContext {
    product: object
  }

  export const useProduct = ProductContext
}