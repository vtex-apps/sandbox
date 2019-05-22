# VTEX IO Sandbox Component

Allows mounting arbitrary HTML content in extension points from the comfort and safety of an iframe.

### Example block

```
  "sandbox#test": {
    "props": {
      "width": "200px",
      "height": "60px",
      "content": "<script src='https://unpkg.com/jquery@3.3.1/dist/jquery.min.js'></script><h1 id='test'>initial</h1><script>$('#test').html(props.productQuery.product.items[0].sellers[0].commertialOffer.ListPrice); console.log(document.cookie)</script>",
      "allowCookies": true
    }
  },
  "store.product": {
    "blocks": [
      "product-details#default",
      "sandbox#test"
    ]
  },
```