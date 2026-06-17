const fs = require('fs');
const file = 'c:/Users/Duoc/Documents/GitHub/donaton/frontend/src/pages/InventarioPage.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Update state declarations
content = content.replace(
  "const categoriasExistentes = [...new Set([\n    ...categoriasBase,\n    ...inventario.map(i => (i.producto || '').toUpperCase()).filter(Boolean)\n  ])].sort();",
  "const categoriasExistentes = [...new Set([\n    ...categoriasBase,\n    ...inventario.map(i => (i.categoria || '').toUpperCase()).filter(Boolean)\n  ])].sort();"
);

content = content.replace(
  "  const [producto, setProducto] = useState(categoriasBase[0]);\n  const [nuevaCategoria, setNuevaCategoria] = useState('');\n  const [modoNuevaCategoria, setModoNuevaCategoria] = useState(false);\n  const [stock, setStock] = useState('');\n  const [detalle, setDetalle] = useState(catalogoProductos[categoriasBase[0]]?.[0] || '');",
  "  const [categoria, setCategoria] = useState(categoriasBase[0]);\n  const [producto, setProducto] = useState(catalogoProductos[categoriasBase[0]]?.[0] || '');\n  const [nuevaCategoria, setNuevaCategoria] = useState('');\n  const [modoNuevaCategoria, setModoNuevaCategoria] = useState(false);\n  const [stock, setStock] = useState('');\n  const [detalle, setDetalle] = useState('');"
);

// 2. Update handleSubmit
content = content.replace(
  "const productoFinal = modoNuevaCategoria ? nuevaCategoria.toUpperCase().trim() : producto;\n    const detalleFinal = modoNuevoProducto ? productoCustom.trim() : detalle;\n\n    if (!productoFinal) {\n      toast.error('Debes seleccionar o crear una categoría de producto.');\n      return;\n    }\n    if (!detalleFinal) {\n      toast.error('Debes seleccionar o crear un producto.');\n      return;\n    }",
  "const categoriaFinal = modoNuevaCategoria ? nuevaCategoria.toUpperCase().trim() : categoria;\n    const productoFinal = modoNuevoProducto ? productoCustom.trim() : producto;\n\n    if (!categoriaFinal) {\n      toast.error('Debes seleccionar o crear una categoría.');\n      return;\n    }\n    if (!productoFinal) {\n      toast.error('Debes seleccionar o crear un producto.');\n      return;\n    }"
);

content = content.replace(
  "const nuevoProducto = {\n      producto: productoFinal,\n      stock: parseFloat(stock),\n      detalle: detalleFinal,\n      unidadMedida\n    };",
  "const nuevoProducto = {\n      categoria: categoriaFinal,\n      producto: productoFinal,\n      stock: parseFloat(stock),\n      detalle,\n      unidadMedida\n    };"
);

content = content.replace(
  "      setProducto(categoriasBase[0]);\n      setNuevaCategoria('');\n      setModoNuevaCategoria(false);\n      setStock('');\n      setDetalle(catalogoProductos[categoriasBase[0]]?.[0] || '');\n      setModoNuevoProducto(false);\n      setProductoCustom('');\n      setUnidadMedida('unidades');",
  "      setCategoria(categoriasBase[0]);\n      setProducto(catalogoProductos[categoriasBase[0]]?.[0] || '');\n      setNuevaCategoria('');\n      setModoNuevaCategoria(false);\n      setStock('');\n      setDetalle('');\n      setModoNuevoProducto(false);\n      setProductoCustom('');\n      setUnidadMedida('unidades');"
);

// 3. Update form rendering
content = content.replace(
  "              <select\n                value={producto}\n                onChange={(e) => {\n                  setProducto(e.target.value);\n                  setDetalle(catalogoProductos[e.target.value]?.[0] || '');\n                  setModoNuevoProducto(false);\n                }}\n                required\n                style={{ flex: 1 }}\n              >\n                {categoriasExistentes.map(cat => (\n                  <option key={cat} value={cat}>{cat}</option>\n                ))}\n              </select>",
  "              <select\n                value={categoria}\n                onChange={(e) => {\n                  setCategoria(e.target.value);\n                  setProducto(catalogoProductos[e.target.value]?.[0] || '');\n                  setModoNuevoProducto(false);\n                }}\n                required\n                style={{ flex: 1 }}\n              >\n                {categoriasExistentes.map(cat => (\n                  <option key={cat} value={cat}>{cat}</option>\n                ))}\n              </select>"
);

content = content.replace(
  "              <select\n                value={detalle}\n                onChange={(e) => setDetalle(e.target.value)}\n                required\n                style={{ flex: 1 }}\n              >\n                {(catalogoProductos[modoNuevaCategoria ? '' : producto] || []).map(prod => (\n                  <option key={prod} value={prod}>{prod}</option>\n                ))}\n              </select>",
  "              <select\n                value={producto}\n                onChange={(e) => setProducto(e.target.value)}\n                required\n                style={{ flex: 1 }}\n              >\n                {(catalogoProductos[modoNuevaCategoria ? '' : categoria] || []).map(prod => (\n                  <option key={prod} value={prod}>{prod}</option>\n                ))}\n              </select>"
);

// Add the input for detalle below
content = content.replace(
  "          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>",
  "          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>\n            <input\n              type=\"text\"\n              placeholder=\"Detalle o Formato opcional (ej: Caja de 20 uds, Lata de 400g)\"\n              value={detalle}\n              onChange={(e) => setDetalle(e.target.value)}\n              style={{ width: '100%' }}\n            />\n          </div>\n          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>"
);


// 4. Update table rendering
content = content.replace(
  "            inventario.reduce((grupos, item) => {\n              const cat = item.producto || 'SIN CATEGORÍA';\n              if (!grupos[cat]) grupos[cat] = [];\n              grupos[cat].push(item);\n              return grupos;\n            }, {})",
  "            inventario.reduce((grupos, item) => {\n              const cat = item.categoria || 'SIN CATEGORÍA';\n              if (!grupos[cat]) grupos[cat] = [];\n              grupos[cat].push(item);\n              return grupos;\n            }, {})"
);

content = content.replace(
  "                        <th>Detalle</th>",
  "                        <th>Producto</th>\n                        <th>Detalle</th>"
);

content = content.replace(
  "                          <td style={{ fontWeight: '500' }}>{i.detalle || '—'}</td>",
  "                          <td style={{ fontWeight: '500' }}>{i.producto || '—'}</td>\n                          <td style={{ color: 'var(--text-secondary)' }}>{i.detalle || '—'}</td>"
);

fs.writeFileSync(file, content);
console.log('Done replacing strings in InventarioPage.jsx');
