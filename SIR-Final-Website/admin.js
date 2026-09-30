const defaultProducts = [
{id:'SIR-01',name:'Indigo Structure Jacket',price:1800,category:'unisex',color:'Indigo Denim',desc:'A structured denim jacket designed with sculpted seams, statement buttons, and a high collar for a bold, sophisticated look.',story:'Born from the idea of turning classic denim into architecture.',img:'assets/indigo.png',limited:false},
{id:'SIR-02',name:'Eclipse Top',price:1800,category:'unisex',color:'Black · Leather',desc:'A cropped leather silhouette with sculpted volume and a clean half-zip finish.',story:'Eclipse is built around contrast: a precise cropped line against exaggerated sleeves.',img:'assets/eclipse.png',limited:false},
{id:'SIR-03',name:'Rouge Check',price:2500,category:'unisex',color:'Rouge',desc:'A distressed checked jacket cut with a relaxed shape, textured surface, and adjustable hem.',story:'Rouge Check carries the feeling of something found, kept, and transformed.',img:'assets/rouge.png',limited:true,note:'LIMITED — WHEN IT’S GONE, IT’S GONE.'},
{id:'SIR-04',name:'Rêve Corset',price:1200,category:'women',color:'Two colorways',desc:'A structured corset with a vintage textile language, available in two colorways.',story:'Rêve takes a vintage textile mood and gives it a sharper silhouette.',img:'assets/corset.png',limited:true,note:'LIMITED — TWO COLORWAYS.'},
{id:'SIR-05',name:'Black Ritual',price:2400,category:'unisex',color:'Black',desc:'A soft-structured black jacket with signature back embroidery and a sculptural collar.',story:'Black Ritual is about what remains unseen until you turn around.',img:'assets/black-ritual.png',limited:false},
{id:'SIR-06',name:'Offset',price:2200,category:'women',color:'Black · Leather',desc:'A cropped leather jacket with an offset closure, oversized sleeves, and a sharp pointed collar.',story:'Offset was shaped around imbalance: an asymmetric closure, controlled volume, and a silhouette that feels slightly out of place in the best way.',img:'assets/offset.png',limited:false},
{id:'SIR-07',name:'Ecru',price:2000,category:'women',color:'Ecru',desc:'A clean cropped jacket in soft ecru, designed with a minimal silhouette and sculpted fit.',story:'Ecru is the pause in the collection. Clean, warm, and intentionally quiet.',img:'assets/ecru.png',limited:false}
];

let products = JSON.parse(localStorage.getItem('sirProducts')||'null') || defaultProducts;
let orders = JSON.parse(localStorage.getItem('sirOrders')||'[]');
products.forEach(p=>{p.sizes=p.sizes||['S','M','L','XL'];p.stock=p.stock||{S:0,M:0,L:0,XL:0};p.trackStock=!!p.trackStock;});
let settings = JSON.parse(localStorage.getItem('sirSettings')||'null') || {
  whatsapp:'201204577313',instapay:'',email:'',arabic:'كُلُّ قِطْعَةٍ لَهَا حِكَايَةٌ.',footer:'Every item has a story.',established:'2026 — Port Said, Egypt'
};

function adminImageForCode(code){return ({'SIR-01':'assets/indigo.png','SIR-02':'assets/eclipse.png','SIR-03':'assets/rouge.png','SIR-04':'assets/corset.png','SIR-05':'assets/black-ritual.png','SIR-06':'assets/offset.png','SIR-07':'assets/ecru.png'}[code]||'assets/hero.png')}
function mapAdminProduct(p, inv){
 const stock={S:0,M:0,L:0,XL:0}; (inv||[]).filter(x=>x.product_id===p.id).forEach(x=>stock[x.size]=Number(x.quantity||0));
 return {id:p.code,name:p.name,price:Number(p.price||0),category:(p.gender||'unisex').toLowerCase(),color:p.color||'',desc:p.description||'',story:p.story||'',img:p.image_url||adminImageForCode(p.code),limited:!!p.limited,note:p.limited_note||'',trackStock:true,stock,sizes:p.sizes||['S','M','L','XL'],dbId:p.id};
}
async function loadAdminFromSupabase(){
 if(!window.SIR_SUPABASE_READY || !window.sirSupabase) return;
 const [{data:dbProducts,error:pe},{data:inv,error:ie},{data:dbOrders,error:oe}] = await Promise.all([
   window.sirSupabase.from('products').select('*').order('code'),
   window.sirSupabase.from('inventory').select('*'),
   window.sirSupabase.from('orders').select('*').order('created_at',{ascending:false})
 ]);
 if(pe||ie){console.warn('Admin product load failed',pe||ie);return;}
 if(dbProducts) products=dbProducts.map(p=>mapAdminProduct(p,inv||[]));
 if(!oe && dbOrders){
   orders=dbOrders.map(o=>({id:String(o.id),createdAt:o.created_at,customer:{name:o.name,phone:o.phone,email:'',address:o.address},payment:o.payment_method,reference:o.payment_screenshot||'',items:(()=>{try{return JSON.parse(o.items_json||'[]')}catch{return[]}})(),total:Number(o.total||0),status:o.status||'New'}));
 }
 localStorage.setItem('sirProducts',JSON.stringify(products)); localStorage.setItem('sirOrders',JSON.stringify(orders)); refresh();
}
async function initAdminAuth(){
 const shell=$('#adminShell'), login=$('#adminLogin'), form=$('#adminLoginForm'), err=$('#loginError');
 if(!window.SIR_SUPABASE_READY || !window.sirSupabase){
   err.textContent='Add the Supabase Publishable Key in supabase-config.js first.';
   return;
 }
 const show=()=>{shell.classList.add('locked');login.classList.remove('hidden')};
 const enter=async()=>{
   err.textContent='';
   const {data,error}=await window.sirSupabase.rpc('is_sir_admin');
   if(error||!data){
     await window.sirSupabase.auth.signOut();
     show();
     err.textContent=error?`Admin verification failed: ${error.message}`:'This account is not authorized for admin access.';
     return;
   }
   shell.classList.remove('locked');login.classList.add('hidden');loadAdminFromSupabase();
 };
 const {data}=await window.sirSupabase.auth.getSession();
 if(data.session) enter(); else show();
 form.onsubmit=async e=>{
   e.preventDefault(); err.textContent='';
   const email=$('#adminEmail').value.trim(), password=$('#adminPassword').value;
   const {error}=await window.sirSupabase.auth.signInWithPassword({email,password});
   if(error){err.textContent=error.message;return;}
   enter();
 };
 $('#adminLogout').onclick=async()=>{await window.sirSupabase.auth.signOut();show()};
 window.sirSupabase.auth.onAuthStateChange((_event,session)=>{if(session)enter();else show()});
}

const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const money=n=>'EGP '+Number(n||0).toLocaleString('en-US');
const saveProducts=async()=>{
 localStorage.setItem('sirProducts',JSON.stringify(products));
 if(window.SIR_SUPABASE_READY && window.sirSupabase){
   const payload=products.map(p=>({code:p.id,name:p.name,price:p.price,category:p.category,gender:p.category==='women'?'Women':'Unisex',color:p.color,material:(p.color||'').toLowerCase().includes('leather')?'Leather':null,description:p.desc,story:p.story,image_url:p.img.startsWith('data:')?null:p.img,limited:!!p.limited,limited_note:p.note||null,sizes:p.sizes||['S','M','L','XL'],active:true}));
   const {error}=await window.sirSupabase.from('products').upsert(payload,{onConflict:'code'});
   if(error){console.error(error);toast('Saved locally; database update failed');} else {
     const {data:rows}=await window.sirSupabase.from('products').select('id,code');
     if(rows){for(const p of products){const row=rows.find(r=>r.code===p.id); if(!row)continue; const stock=Object.entries(p.stock||{}).map(([size,quantity])=>({product_id:row.id,size,color:'',quantity:Number(quantity||0),low_stock_threshold:2})); if(stock.length) await window.sirSupabase.from('inventory').upsert(stock,{onConflict:'product_id,size,color'});}}
   }
 }
 refresh();
};
const stockTotal=p=>Object.values(p.stock||{}).reduce((a,n)=>a+Number(n||0),0);
const stockLabel=p=>!p.trackStock?'UNTRACKED':stockTotal(p)===0?'OUT OF STOCK':stockTotal(p)<=5?'LOW · '+stockTotal(p):'IN STOCK · '+stockTotal(p);
const saveOrders=()=>localStorage.setItem('sirOrders',JSON.stringify(orders));
function toast(t){const x=$('#toast');x.textContent=t;x.classList.add('show');setTimeout(()=>x.classList.remove('show'),2200)}
function refresh(){
  $('#statProducts').textContent=String(products.length).padStart(2,'0');
  $('#statLimited').textContent=String(products.filter(p=>p.limited).length).padStart(2,'0');
  $('#statOrders').textContent=String(orders.length).padStart(2,'0');
  $('#statRevenue').textContent=money(orders.reduce((a,o)=>a+Number(o.total||0),0));
  renderProducts();renderOrders();renderRecent();renderInventory();
}
function go(view){
  $$('.view').forEach(v=>v.classList.remove('active'));
  $('#view-'+view).classList.add('active');
  $$('.side-link').forEach(b=>b.classList.toggle('active',b.dataset.view===view));
  $('#pageTitle').textContent=view[0].toUpperCase()+view.slice(1);
  $('#sidebar').classList.remove('open');
}
$$('.side-link').forEach(b=>b.onclick=()=>go(b.dataset.view));
$$('[data-go]').forEach(b=>b.onclick=()=>go(b.dataset.go));
$('#mobileMenu').onclick=()=>$('#sidebar').classList.toggle('open');

function renderRecent(){
  const el=$('#recentOrders');
  if(!orders.length){el.innerHTML='<div class="empty">No saved orders yet.</div>';return}
  el.innerHTML=orders.slice(0,5).map(o=>`<div class="recent-row"><div><b>${o.id}</b><small>${o.customer?.name||'Customer'} · ${new Date(o.createdAt).toLocaleString()}</small></div><span class="status">${o.status||'New'}</span><strong>${money(o.total)}</strong></div>`).join('');
}
function renderProducts(){
  const el=$('#productAdminList');
  el.innerHTML=products.map((p,i)=>`<div class="product-row"><img src="${p.img}" alt=""><div><h4>${p.name}</h4><small>${p.id} · ${p.color}</small></div><div class="price">${money(p.price)}</div><div>${p.category}</div><div>${p.limited?'<span class="tag">LIMITED</span>':'—'}</div><div><span class="stock-pill ${p.trackStock&&stockTotal(p)===0?'out':p.trackStock&&stockTotal(p)<=5?'low':''}">${stockLabel(p)}</span></div><div class="row-actions"><button class="mini" data-edit="${i}">EDIT</button><button class="mini delete" data-delete="${i}">DELETE</button></div></div>`).join('');
  el.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>openEditor(Number(b.dataset.edit)));
  el.querySelectorAll('[data-delete]').forEach(b=>b.onclick=async()=>{const i=Number(b.dataset.delete);if(confirm('Delete '+products[i].name+'?')){const code=products[i].id;products.splice(i,1);if(window.SIR_SUPABASE_READY&&window.sirSupabase){const {error}=await window.sirSupabase.from('products').update({active:false}).eq('code',code);if(error){toast('Local delete saved; database update failed');}}saveProducts();toast('Product deleted')}})
}
function renderOrders(){
  const el=$('#orderList');
  if(!orders.length){el.innerHTML='<div class="panel empty">No saved orders yet. Place an order from the storefront to create a local record.</div>';return}
  const shown=filteredOrders();
  if(!shown.length){el.innerHTML='<div class="panel empty">No orders match this filter.</div>';return}
  el.innerHTML=shown.map(o=>`<article class="order-card"><div class="order-head"><div><h4>${o.id} · ${o.customer?.name||'Customer'}</h4><small>${new Date(o.createdAt).toLocaleString()} · ${o.customer?.phone||''}</small></div><select class="order-status" data-id="${o.id}"><option ${o.status==='New'?'selected':''}>New</option><option ${o.status==='Confirmed'?'selected':''}>Confirmed</option><option ${o.status==='Preparing'?'selected':''}>Preparing</option><option ${o.status==='Shipped'?'selected':''}>Shipped</option><option ${o.status==='Completed'?'selected':''}>Completed</option><option ${o.status==='Cancelled'?'selected':''}>Cancelled</option></select><strong>${money(o.total)}</strong></div><div class="order-body"><div>${(o.items||[]).map(x=>`<div class="order-item"><span>${x.name} · ${x.size} × ${x.qty}</span><b>${money(x.price*x.qty)}</b></div>`).join('')}<div class="inline-total"><span>TOTAL</span><span>${money(o.total)}</span></div></div><div class="order-meta-box"><b>CUSTOMER</b><br>${o.customer?.email||'—'}<br>${o.customer?.address||'—'}<br><br><b>PAYMENT</b><br>${o.payment==='cod'?'Cash on Delivery':'InstaPay'}<br>Ref: ${o.reference||'—'}</div></div></article>`).join('');
  el.querySelectorAll('[data-id]').forEach(s=>s.onchange=async()=>{const o=orders.find(x=>x.id===s.dataset.id);if(o){o.status=s.value;if(window.SIR_SUPABASE_READY&&window.sirSupabase){const {error}=await window.sirSupabase.from('orders').update({status:s.value}).eq('id',Number(s.dataset.id));if(error){toast('Local status saved; database update failed');}}saveOrders();refresh();toast('Order updated')}});
}
$('#clearOrders').onclick=()=>{if(confirm('Clear all saved local orders?')){orders=[];saveOrders();refresh();toast('Orders cleared')}};

function openEditor(index=-1){
  $('#editIndex').value=index;
  $('#editorTitle').textContent=index<0?'Add product':'Edit product';
  const p=index<0?{id:'SIR-08',name:'',price:0,category:'unisex',color:'',desc:'',story:'',img:'assets/hero.png',limited:false,note:''}:products[index];
  $('#pId').value=p.id;$('#pName').value=p.name;$('#pPrice').value=p.price;$('#pCategory').value=p.category;$('#pColor').value=p.color;$('#pDesc').value=p.desc;$('#pStory').value=p.story;$('#pImg').value=p.img;$('#pLimited').value=String(!!p.limited);$('#pNote').value=p.note||'';$('#pTrackStock').checked=!!p.trackStock;['S','M','L','XL'].forEach(sz=>$('#stock'+sz).value=Number((p.stock||{})[sz]||0));
  $('#imagePreview').innerHTML=`<img src="${p.img}" alt="">`;
  $('#productEditor').classList.add('open');
}
function closeEditor(){$('#productEditor').classList.remove('open')}
$('#addProduct').onclick=()=>openEditor(-1);
$('#closeEditor').onclick=closeEditor;$('#cancelEditor').onclick=closeEditor;
$('#pImageFile').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{$('#pImg').value=r.result;$('#imagePreview').innerHTML=`<img src="${r.result}" alt="">`};r.readAsDataURL(f)};
$('#pImg').oninput=e=>{if(e.target.value)$('#imagePreview').innerHTML=`<img src="${e.target.value}" alt="">`};
$('#productForm').onsubmit=e=>{
 e.preventDefault();
 const p={id:$('#pId').value.trim(),name:$('#pName').value.trim(),price:Number($('#pPrice').value),category:$('#pCategory').value,color:$('#pColor').value.trim(),desc:$('#pDesc').value.trim(),story:$('#pStory').value.trim(),img:$('#pImg').value.trim(),limited:$('#pLimited').value==='true',note:$('#pNote').value.trim(),trackStock:$('#pTrackStock').checked,stock:{S:Number($('#stockS').value||0),M:Number($('#stockM').value||0),L:Number($('#stockL').value||0),XL:Number($('#stockXL').value||0)},sizes:['S','M','L','XL']};
 const idx=Number($('#editIndex').value);
 if(products.some((x,i)=>x.id===p.id&&i!==idx)){alert('That product code already exists.');return}
 if(idx<0)products.push(p);else products[idx]=p;
 saveProducts();closeEditor();toast('Product saved');
};

function renderInventory(){
 const el=$('#inventoryList'); if(!el)return;
 el.innerHTML=products.map((p,i)=>`<div class="product-row"><img src="${p.img}" alt=""><div><h4>${p.name}</h4><small>${p.id} · ${p.color}</small></div><div>${p.trackStock?stockTotal(p)+' units':'—'}</div><div><span class="stock-pill ${p.trackStock&&stockTotal(p)===0?'out':p.trackStock&&stockTotal(p)<=5?'low':''}">${stockLabel(p)}</span></div><div>${p.trackStock?Object.entries(p.stock).map(([k,v])=>k+': '+v).join(' · '):'Tracking off'}</div><div class="row-actions"><button class="mini" data-stock-edit="${i}">EDIT STOCK</button></div></div>`).join('');
 el.querySelectorAll('[data-stock-edit]').forEach(b=>b.onclick=()=>{go('products');openEditor(Number(b.dataset.stockEdit));setTimeout(()=>$('#pTrackStock').focus(),50)});
}
function filteredOrders(){const q=($('#orderSearch')?.value||'').toLowerCase().trim(),f=$('#orderFilter')?.value||'all';return orders.filter(o=>{const hit=!q||[o.id,o.customer?.name,o.customer?.phone,o.customer?.email].join(' ').toLowerCase().includes(q);return hit&&(f==='all'||(o.status||'New')===f)})}
function exportOrders(){const rows=[['Order','Date','Customer','Phone','Email','Payment','Status','Total'],...filteredOrders().map(o=>[o.id,new Date(o.createdAt).toISOString(),o.customer?.name||'',o.customer?.phone||'',o.customer?.email||'',o.payment==='cod'?'Cash on Delivery':'InstaPay',o.status||'New',o.total||0])];const csv=rows.map(r=>r.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(',')).join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='sir-orders.csv';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)}
$('#orderSearch')?.addEventListener('input',renderOrders);$('#orderFilter')?.addEventListener('change',renderOrders);$('#exportOrders')?.addEventListener('click',exportOrders);
function loadSettings(){
 $('#setWhatsapp').value=settings.whatsapp;$('#setInstapay').value=settings.instapay;$('#setEmail').value=settings.email;$('#setArabic').value=settings.arabic;$('#setFooter').value=settings.footer;$('#setEstablished').value=settings.established;
}
$('#saveSettings').onclick=()=>{settings={whatsapp:$('#setWhatsapp').value.trim(),instapay:$('#setInstapay').value.trim(),email:$('#setEmail').value.trim(),arabic:$('#setArabic').value.trim(),footer:$('#setFooter').value.trim(),established:$('#setEstablished').value.trim()};localStorage.setItem('sirSettings',JSON.stringify(settings));toast('Settings saved')};
$('#resetProducts').onclick=()=>{if(confirm('Restore the original seven products?')){products=JSON.parse(JSON.stringify(defaultProducts));products.forEach(p=>{p.sizes=['S','M','L','XL'];p.stock={S:0,M:0,L:0,XL:0};p.trackStock=false});saveProducts();toast('Original catalog restored')}};

loadSettings();refresh();
initAdminAuth();
