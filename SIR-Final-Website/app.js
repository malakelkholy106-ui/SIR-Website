const defaultProducts=[
{id:'SIR-01',name:'Indigo Structure Jacket',price:1800,category:'unisex',color:'Indigo Denim',desc:'A structured denim jacket designed with sculpted seams, statement buttons, and a high collar for a bold, sophisticated look.',story:'Born from the idea of turning classic denim into architecture. Indigo Structure follows the body with sculpted seams, a raised collar, and deliberate hardware — a piece made to feel familiar, but never ordinary.',img:'assets/indigo.png',limited:false},
{id:'SIR-02',name:'Eclipse Top',price:1800,category:'unisex',color:'Black · Leather',desc:'A cropped leather silhouette with sculpted volume and a clean half-zip finish.',story:'Eclipse is built around contrast: a precise cropped line against exaggerated sleeves. The dark leather surface keeps the silhouette quiet while the shape does the talking.',img:'assets/eclipse.png',limited:false},
{id:'SIR-03',name:'Rouge Check',price:2500,category:'unisex',color:'Rouge',desc:'A distressed checked jacket cut with a relaxed shape, textured surface, and adjustable hem.',story:'Rouge Check carries the feeling of something found, kept, and transformed. Its worn texture and deep red checks turn a familiar pattern into a statement with its own history.',img:'assets/rouge.png',limited:true,note:'LIMITED — WHEN IT’S GONE, IT’S GONE.'},
{id:'SIR-04',name:'Rêve Corset',price:1200,category:'women',color:'Two colorways',desc:'A structured corset with a vintage textile language, available in two colorways.',story:'Rêve takes a vintage textile mood and gives it a sharper silhouette. Two colorways, one idea: something delicate can still hold its ground.',img:'assets/corset.png',limited:true,note:'LIMITED — TWO COLORWAYS.'},
{id:'SIR-05',name:'Black Ritual',price:2400,category:'unisex',color:'Black',desc:'A soft-structured black jacket with signature back embroidery and a sculptural collar.',story:'Black Ritual is about what remains unseen until you turn around. The front stays restrained; the signature back detail gives the piece its quiet reveal.',img:'assets/black-ritual.png',limited:false},
{id:'SIR-06',name:'Offset',price:2200,category:'women',color:'Black · Leather',desc:'A cropped leather jacket with an offset closure, oversized sleeves, and a sharp pointed collar.',story:'Offset was shaped around imbalance: an asymmetric closure, controlled volume, and a silhouette that feels slightly out of place in the best way.',img:'assets/offset.png',limited:false},
{id:'SIR-07',name:'Ecru',price:2000,category:'women',color:'Ecru',desc:'A clean cropped jacket in soft ecru, designed with a minimal silhouette and sculpted fit.',story:'Ecru is the pause in the collection. Clean, warm, and intentionally quiet — a piece designed to let texture, movement, and the person wearing it take the lead.',img:'assets/ecru.png',limited:false}
];
let products=JSON.parse(localStorage.getItem('sirProducts')||'null')||defaultProducts;
let cart=JSON.parse(localStorage.getItem('sirCart')||'[]'),currentProduct=null,modalQty=1,wishlist=new Set(JSON.parse(localStorage.getItem('sirWishlist')||'[]'));
const money=n=>'EGP '+Number(n).toLocaleString('en-US');
const imageForCode=code=>({
 'SIR-01':'assets/indigo.png','SIR-02':'assets/eclipse.png','SIR-03':'assets/rouge.png','SIR-04':'assets/corset.png',
 'SIR-05':'assets/black-ritual.png','SIR-06':'assets/offset.png','SIR-07':'assets/ecru.png'
}[code]||'assets/hero.png');
function mapDbProduct(p, inventory){
 const stock={S:0,M:0,L:0,XL:0};
 (inventory||[]).filter(x=>x.product_id===p.id).forEach(x=>{stock[x.size]=Number(x.quantity||0)});
 return {id:p.code,name:p.name,price:Number(p.price||0),category:(p.gender||'unisex').toLowerCase(),color:p.color||'',desc:p.description||'',story:p.story||'',img:p.image_url||imageForCode(p.code),limited:!!p.limited,note:p.limited_note||'',trackStock:true,stock,sizes:p.sizes||['S','M','L','XL'],dbId:p.id};
}
async function loadProductsFromSupabase(){
 if(!window.SIR_SUPABASE_READY || !window.sirSupabase) return;
 const [{data:dbProducts,error:pError},{data:dbInventory,error:iError}] = await Promise.all([
   window.sirSupabase.from('products').select('*').eq('active',true).order('code'),
   window.sirSupabase.from('inventory').select('*')
 ]);
 if(pError || iError){ console.warn('SIR Supabase load failed; using local catalog.', pError||iError); return; }
 if(dbProducts?.length) products=dbProducts.map(p=>mapDbProduct(p,dbInventory||[]));
 localStorage.setItem('sirProducts',JSON.stringify(products));
 renderProducts();
}
const $=s=>document.querySelector(s);
function save(){localStorage.setItem('sirCart',JSON.stringify(cart));renderCart();updateCount()}
function updateCount(){const n=cart.reduce((a,x)=>a+x.qty,0);$('#bagCount').textContent=n;$('#drawerCount').textContent=n}
function renderProducts(filter='all'){
 const grid=$('#productGrid');grid.innerHTML='';let shown=0;
 products.forEach(p=>{if(filter!=='all'&&filter!=='limited'&&p.category!==filter)return;if(filter==='limited'&&!p.limited)return;shown++;
 const card=document.createElement('article');card.className='product-card';card.innerHTML=`<div class="product-image"><img src="${p.img}" alt="${p.name}"><span class="image-code">${p.id}</span>${p.limited?'<span class="limited-badge">LIMITED</span>':''}${p.trackStock&&Number((p.stock||{})[p.sizes?.[0]||'S']||0)===0?'<span class="limited-badge">STOCKED</span>':''}</div><div class="product-info"><div><span class="code">${p.id}</span><h3>${p.name}</h3><p>${p.color}</p></div><strong class="price">${money(p.price)}</strong></div><div class="story-tease">VIEW PIECE <span>→</span></div>`;card.onclick=()=>openProduct(p);grid.appendChild(card)});
 $('#collectionCount').textContent=String(shown).padStart(2,'0')+' PIECES';
}
function openProduct(p){currentProduct=p;modalQty=1;$('#modalQty').textContent='1';$('#modalImg').src=p.img;$('#modalImg').alt=p.name;$('#modalName').textContent=p.name;$('#modalCode').textContent=p.id;$('#modalDesc').textContent=p.desc;$('#modalStory').textContent=p.story;$('#modalPrice').textContent=money(p.price);$('#modalColor').textContent=p.color;$('#modalLimited').textContent=p.note||'';$('#modalWish').textContent=wishlist.has(p.id)?'♥':'♡';$('#productModal').classList.add('open');$('#productModal').setAttribute('aria-hidden','false')}
function addToBag(p,size,qty=1){const available=p.trackStock?Number((p.stock||{})[size]||0):Infinity;const already=cart.find(x=>x.id===p.id&&x.size===size)?.qty||0;if(p.trackStock&&already+qty>available){alert(available>0?'Only '+available+' left in size '+size+'.':'Size '+size+' is sold out.');return false}const found=cart.find(x=>x.id===p.id&&x.size===size);if(found)found.qty+=qty;else cart.push({...p,size,qty});save();closeModal('#productModal');openDrawer();return true}
function renderCart(){const el=$('#cartItems');if(!cart.length){el.innerHTML='<div style="padding:50px 0;color:#a99c8c">Your bag is quiet. Add a piece to begin.</div>';$('#subtotal').textContent='EGP 0';return}el.innerHTML='';cart.forEach((x,i)=>{const row=document.createElement('div');row.className='cart-row';row.innerHTML=`<img src="${x.img}" alt=""><div><h4>${x.name}</h4><small>${x.size} · ${x.color}</small><div class="qty"><button data-a="minus">−</button><span>${x.qty}</span><button data-a="plus">+</button></div></div><div><strong>${money(x.price*x.qty)}</strong><br><button class="remove" data-a="remove">REMOVE</button></div>`;row.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{let a=b.dataset.a;if(a==='plus')cart[i].qty++;if(a==='minus')cart[i].qty--;if(a==='remove')cart.splice(i,1);cart=cart.filter(x=>x.qty>0);save()});el.appendChild(row)});$('#subtotal').textContent=money(cart.reduce((a,x)=>a+x.price*x.qty,0))}
function openDrawer(){$('#cartDrawer').classList.add('open');$('#cartDrawer').setAttribute('aria-hidden','false')}
function closeModal(id){$(id).classList.remove('open');$(id).setAttribute('aria-hidden','true')}
function renderCheckout(){$('#checkoutItems').innerHTML=cart.map(x=>`<div class="summary-item"><img src="${x.img}" alt=""><div>${x.name}<span>${x.size} · ${x.qty} × ${money(x.price)}</span></div></div>`).join('');const total=cart.reduce((a,x)=>a+x.price*x.qty,0);$('#checkoutSubtotal').textContent=money(total);$('#checkoutTotal').textContent=money(total)}
function search(q){q=q.trim().toLowerCase();const box=$('#searchResults');if(!q){box.innerHTML='';return}const hits=products.filter(p=>[p.name,p.id,p.category,p.color].join(' ').toLowerCase().includes(q));box.innerHTML=hits.map(p=>`<div class="search-result" data-id="${p.id}"><div>${p.name}<small>${p.id}</small></div><span>${money(p.price)}</span></div>`).join('')||'<p style="color:#a99c8c">No piece found.</p>';box.querySelectorAll('.search-result').forEach(r=>r.onclick=()=>{const p=products.find(x=>x.id===r.dataset.id);closeModal('#searchModal');openProduct(p)})}

document.querySelectorAll('.filter').forEach(b=>b.onclick=()=>{document.querySelectorAll('.filter').forEach(x=>x.classList.remove('active'));b.classList.add('active');renderProducts(b.dataset.filter)});
$('#openCart').onclick=openDrawer;$('#closeCart').onclick=()=>closeModal('#cartDrawer');$('#closeProduct').onclick=()=>closeModal('#productModal');
$('#modalQty').textContent='1';$('#qtyPlus').onclick=()=>{modalQty++;$('#modalQty').textContent=modalQty};$('#qtyMinus').onclick=()=>{modalQty=Math.max(1,modalQty-1);$('#modalQty').textContent=modalQty};
$('#modalAdd').onclick=()=>addToBag(currentProduct,$('#modalSize').value,modalQty);$('#modalBuy').onclick=()=>{addToBag(currentProduct,$('#modalSize').value,modalQty);renderCheckout();closeModal('#cartDrawer');$('#checkoutModal').classList.add('open')};
$('#modalWish').onclick=()=>{if(!currentProduct)return;if(wishlist.has(currentProduct.id))wishlist.delete(currentProduct.id);else wishlist.add(currentProduct.id);localStorage.setItem('sirWishlist',JSON.stringify([...wishlist]));$('#modalWish').textContent=wishlist.has(currentProduct.id)?'♥':'♡'};
$('#checkoutBtn').onclick=()=>{if(!cart.length){alert('Your bag is empty.');return}renderCheckout();closeModal('#cartDrawer');$('#checkoutModal').classList.add('open')};$('#closeCheckout').onclick=()=>closeModal('#checkoutModal');
$('#paymentMethod').onchange=e=>$('#instapayBox').classList.toggle('hidden',e.target.value!=='instapay');
$('#checkoutForm').onsubmit=async e=>{
 e.preventDefault();
 if(!cart.length)return;
 const name=$('#customerName').value.trim(),phone=$('#customerPhone').value.trim(),email=$('#customerEmail').value.trim(),address=$('#customerAddress').value.trim(),method=$('#paymentMethod').value,ref=$('#paymentRef').value.trim(),total=cart.reduce((a,x)=>a+x.price*x.qty,0);
 const lines=cart.map(x=>`${x.name} (${x.id}) — ${x.size} × ${x.qty} — ${money(x.price*x.qty)}`).join('\n');
 const msg=`SIR ORDER\n\nName: ${name}\nPhone: ${phone}\nEmail: ${email||'-'}\nAddress: ${address}\nPayment: ${method==='cod'?'Cash on Delivery':'InstaPay'}\nPayment reference: ${ref||'-'}\n\n${lines}\n\nSubtotal: ${money(total)}`;
 const items=cart.map(x=>({id:x.id,name:x.name,size:x.size,qty:x.qty,price:x.price,color:x.color||''}));
 let savedToDatabase=false;
 if(window.SIR_SUPABASE_READY && window.sirSupabase){
   const {data:orderId,error}=await window.sirSupabase.rpc('place_sir_order',{
     p_name:name,p_phone:phone,p_address:address,p_notes:email?`Email: ${email}\nPayment reference: ${ref||'-'}`:`Payment reference: ${ref||'-'}`,
     p_items:items,p_total:total,p_payment_method:method,p_payment_screenshot:ref||null
   });
   if(error){ alert('Order could not be saved. '+error.message); return; }
   savedToDatabase=true;
   localStorage.setItem('sirLastOrderId',String(orderId));
 }
 if(!savedToDatabase){
   const order={id:'SIR-'+Date.now().toString().slice(-6),createdAt:new Date().toISOString(),customer:{name,phone,email,address},payment:method,reference:ref,items:cart.map(x=>({id:x.id,name:x.name,size:x.size,qty:x.qty,price:x.price,img:x.img})),total,status:'New'};
   const orders=JSON.parse(localStorage.getItem('sirOrders')||'[]');orders.unshift(order);localStorage.setItem('sirOrders',JSON.stringify(orders));
 }
 cart=[];save();
 const whatsappUrl='https://wa.me/201204577313?text='+encodeURIComponent(msg);
 window.location.href=whatsappUrl;
};
$('#successClose').onclick=()=>{closeModal('#checkoutModal');$('#successBox').classList.add('hidden');$('#checkoutForm').classList.remove('hidden');window.scrollTo({top:0,behavior:'smooth'})};
$('#openSearch').onclick=()=>{$('#searchModal').classList.add('open');$('#searchModal').setAttribute('aria-hidden','false');setTimeout(()=>$('#searchInput').focus(),100)};$('#closeSearch').onclick=()=>closeModal('#searchModal');$('#searchInput').oninput=e=>search(e.target.value);
window.addEventListener('keydown',e=>{if(e.key==='Escape')['#cartDrawer','#productModal','#checkoutModal','#searchModal'].forEach(closeModal)});
renderCart();updateCount();
loadProductsFromSupabase();

// Cinematic hero parallax — intentionally subtle.
(() => {
  const hero = document.querySelector('#home');
  const layer = document.querySelector('#heroMotion');
  if (!hero || !layer || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let tx=0, ty=0, cx=0, cy=0, raf=0;
  const animate=()=>{
    cx += (tx-cx)*0.055;
    cy += (ty-cy)*0.055;
    layer.style.transform=`translate3d(${cx}px,${cy}px,0)`;
    raf=requestAnimationFrame(animate);
  };
  hero.addEventListener('pointermove', e=>{
    const r=hero.getBoundingClientRect();
    tx=((e.clientX-r.left)/r.width-.5)*10;
    ty=((e.clientY-r.top)/r.height-.5)*6;
  }, {passive:true});
  hero.addEventListener('pointerleave', ()=>{tx=0;ty=0;}, {passive:true});
  animate();
  window.addEventListener('scroll',()=>{
    const r=hero.getBoundingClientRect();
    const p=Math.max(0,Math.min(1,-r.top/Math.max(1,r.height)));
    layer.style.opacity=String(1-Math.max(0,p*.55));
  }, {passive:true});
})();
