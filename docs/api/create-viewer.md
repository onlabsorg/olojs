createViewer - function
============================================================================
In a browser environment, this function creates a widget that renders the
document mapped to the `src` attribute in a given store.

**HTML**
```html
<olo-viewer id="container" src="/path/to/doc?x=1;y=2"></olo-viewer>
```

**JavaScript**
```js
elt = document.querySelector("#container");
olojs.createViewer(elt, store);
```

Optionally, the src attribute value can be bound to the page URL hash as
follows:

```html
<olo-viewer id="container" :src="hash"></olo-viewer>
```
  

