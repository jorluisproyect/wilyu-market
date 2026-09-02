const fs=require('fs');
const path=require('path');

const appPath=path.join(process.cwd(),'src','App.tsx');
if(!fs.existsSync(appPath)){
  console.error('❌ Ejecuta este archivo dentro de C:\\Proyectos\\Wilyu-Market-Git');
  process.exit(1);
}

let app=fs.readFileSync(appPath,'utf8');
const stamp=Date.now();
fs.copyFileSync(appPath,appPath+'.backup-delete-ui-'+stamp);

function replaceExact(oldText,newText,label){
  if(!app.includes(oldText)){
    console.error('❌ No encontré: '+label);
    process.exit(1);
  }
  app=app.replace(oldText,newText);
  console.log('✅ '+label);
}

// Pedido: icono solamente
replaceExact(
`<button className="delete-button-small" onClick={()=>remove(o)} style={{cursor:'pointer'}}>
     <Trash2 size={17}/> Eliminar
    </button>`,
`<button
     className="delete-button-small"
     onClick={()=>remove(o)}
     style={{cursor:'pointer',width:38,height:38,padding:0,display:'inline-flex',alignItems:'center',justifyContent:'center'}}
     title="Eliminar pedido"
     aria-label="Eliminar pedido"
    >
     <Trash2 size={17}/>
    </button>`,
'Pedido: botón eliminar solo icono'
);

// Confirmación pedido
app=app.replace(
`if(!confirm('¿Eliminar definitivamente el pedido '+o.id+'? Esta acción no se puede deshacer.'))return`,
`if(!confirm('¿Seguro que quiere eliminar este pedido '+o.id+'? Esta acción no se puede deshacer.'))return`
);
console.log('✅ Pedido: confirmación mejorada');

// Producto: confirmar desde el propio botón de eliminar
replaceExact(
`{del&&<button type="button" className="delete-button-small" onClick={del}><Trash2/></button>}`,
`{del&&<button
 type="button"
 className="delete-button-small"
 onClick={()=>{if(confirm('¿Seguro que quiere eliminar este producto? Esta acción no se puede deshacer.'))del()}}
 title="Eliminar producto"
 aria-label="Eliminar producto"
 style={{width:38,height:38,padding:0,display:'inline-flex',alignItems:'center',justifyContent:'center'}}
><Trash2 size={17}/></button>}`,
'Producto: icono pequeño + confirmación'
);

// Categoría: mensaje + accesibilidad
app=app.replace(
`if(!confirm('¿Eliminar categoría?'))return`,
`if(!confirm('¿Seguro que quiere eliminar esta categoría? Esta acción no se puede deshacer.'))return`
);
app=app.replace(
`<button className="danger-icon" onClick={()=>remove(c.id)}><Trash2/></button>`,
`<button className="danger-icon" onClick={()=>remove(c.id)} title="Eliminar categoría" aria-label="Eliminar categoría"><Trash2 size={17}/></button>`
);
console.log('✅ Categorías: confirmación + icono');

// Proveedor: mensaje + accesibilidad
app=app.replace(
`if(!confirm('¿Eliminar proveedor?'))return`,
`if(!confirm('¿Seguro que quiere eliminar este proveedor? Esta acción no se puede deshacer.'))return`
);
app=app.replace(
`<button className="danger-icon" onClick={()=>remove(x.id)}><Trash2/></button>`,
`<button className="danger-icon" onClick={()=>remove(x.id)} title="Eliminar proveedor" aria-label="Eliminar proveedor"><Trash2 size={17}/></button>`
);
console.log('✅ Proveedores: confirmación + icono');

// Verificaciones
const checks=[
 ['Confirmación pedido',app.includes('¿Seguro que quiere eliminar este pedido')],
 ['Confirmación producto',app.includes('¿Seguro que quiere eliminar este producto?')],
 ['Confirmación categoría',app.includes('¿Seguro que quiere eliminar esta categoría?')],
 ['Confirmación proveedor',app.includes('¿Seguro que quiere eliminar este proveedor?')],
 ['Pedido icon-only',app.includes('aria-label="Eliminar pedido"')]
];

const failed=checks.filter(x=>!x[1]);
if(failed.length){
  failed.forEach(x=>console.error('❌ Falló verificación:',x[0]));
  process.exit(1);
}

fs.writeFileSync(appPath,app,'utf8');

console.log('');
console.log('✅ WILYU: BOTONES DE ELIMINAR ACTUALIZADOS');
console.log('• Pedido: solo icono pequeño');
console.log('• Producto: solo icono + confirmación');
console.log('• Categoría: solo icono + confirmación');
console.log('• Proveedor: solo icono + confirmación');
console.log('');
console.log('Ahora ejecuta: npm.cmd run build');
