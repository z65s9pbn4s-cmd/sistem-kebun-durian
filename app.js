const $=s=>document.querySelector(s), esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const keys=['trees','inputs','expenses','sales','photos','tasks'];
let data={};
keys.forEach(k=>{try{data[k]=JSON.parse(localStorage.getItem('dfm_'+k)||'[]');if(!Array.isArray(data[k]))data[k]=[]}catch{data[k]=[]}});
let tab='home', editing={};
function save(k){localStorage.setItem('dfm_'+k,JSON.stringify(data[k]));}
function id(){return Date.now()+Math.floor(Math.random()*999)}
function rm(n){return 'RM '+Number(n||0).toLocaleString('ms-MY',{minimumFractionDigits:2,maximumFractionDigits:2})}
function date(){return new Date().toLocaleDateString('en-GB')}
function isoDate(){return new Date().toISOString().slice(0,10)}
function total(k,f){return data[k].reduce((a,x)=>a+Number(x[f]||0),0)}
function shell(){document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));}
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{tab=b.dataset.tab;editing={};render()});
function cardMetric(title,val,emoji){return `<div class="card metric"><span>${emoji} ${title}</span><b>${val}</b></div>`}
function empty(){return '<div class="empty">Belum ada rekod. Isi borang dan tekan butang tambah untuk bermula.</div>'}
function actions(k,x){return `<div class="actions"><button type="button" class="btn2" data-edit="${k}" data-id="${x.id}">Kemaskini</button><button type="button" class="btn2" data-delete="${k}" data-id="${x.id}">Padam</button></div>`}
function val(x,k){return esc(x?.[k]??'')}
function field(label,name,value='',type='text',extra=''){return `<label>${label}</label><input name="${name}" type="${type}" value="${value}" ${extra}>`}
function area(label,name,value=''){return `<label>${label}</label><textarea name="${name}">${value}</textarea>`}
function selectField(label,name,opts,current){return `<label>${label}</label><select name="${name}">${opts.map(o=>`<option ${o===current?'selected':''}>${o}</option>`).join('')}</select>`}
function formHead(title,k,x){return `<h3>${title}</h3><form data-form="${k}" data-id="${x?.id??''}">`}
function formEnd(k,x,add){return `<button>${x?'Simpan perubahan':add}</button>${x?` <button type="button" class="btn2" data-cancel="${k}">Batal</button>`:''}</form>`}
function recordList(k,fn){return data[k].length?data[k].slice().reverse().map(x=>`<div class="item"><div class="record-main">${fn(x)}</div>${actions(k,x)}</div>`).join(''):empty()}
function render(){
 shell();const app=$('#app');if(!app)return;
 if(tab==='home'){
  const costs=total('expenses','amount')+total('inputs','cost'),income=data.sales.reduce((a,x)=>a+Number(x.weight||0)*Number(x.price||0),0);
  app.innerHTML=`<section class="hero"><small>PROFIL KEBUN</small><h2>Pengurusan Kebun Durian</h2><div>Bawah 5 ekar · Kurang 100 pokok · Umur 1–3 tahun</div></section><div class="grid">${cardMetric('Pokok direkodkan',data.trees.length,'🌳')}${cardMetric('Pokok bermasalah',data.trees.filter(x=>x.status==='Bermasalah').length,'⚠️')}${cardMetric('Jumlah kos',rm(costs),'📉')}${cardMetric('Pendapatan',rm(income),'📈')}</div><div class="card"><h3>Untung / (Rugi)</h3><b>${rm(income-costs)}</b><p class="muted">Ringkasan dikira daripada rekod perbelanjaan dan jualan.</p></div><div class="notice">Data disimpan pada pelayar iPhone ini. Buat sandaran JSON secara berkala dan simpan di Files atau iCloud Drive.</div>`;
 }
 if(tab==='trees'){
  const x=data.trees.find(t=>String(t.id)===String(editing.trees));
  app.innerHTML=formHead('🌳 Rekod setiap pokok','trees',x)+field('Kod pokok','code',val(x,'code'),'text','required')+field('Varieti','variety',val(x,'variety'))+field('Tarikh tanam','planted',val(x,'planted'),'date')+field('Lokasi / baris','location',val(x,'location'))+selectField('Keadaan','status',['Sihat','Bermasalah','Perlu pemantauan','Mati'],x?.status||'Sihat')+area('Catatan','notes',val(x,'notes'))+formEnd('trees',x,'Tambah pokok')+`<div class="card">${recordList('trees',t=>`<strong>${val(t,'code')} · ${val(t,'variety')}</strong><small>${val(t,'planted')} · ${val(t,'location')}</small><span class="tag">${val(t,'status')}</span>${t.notes?`<small>${val(t,'notes')}</small>`:''}`)}</div>`;
 }
 if(tab==='inputs'){
  const x=data.inputs.find(t=>String(t.id)===String(editing.inputs));
  app.innerHTML=formHead('🧪 Rekod baja & racun','inputs',x)+field('Tarikh','date',val(x,'date')||isoDate(),'date')+field('Kod pokok / kawasan','tree',val(x,'tree'))+selectField('Aktiviti','type',['Baja','Racun kulat','Racun serangga','Kawalan rumpai','Lain-lain'],x?.type||'Baja')+field('Nama produk','product',val(x,'product'))+field('Dos / kadar (rujuk label)','dose',val(x,'dose'))+field('Kuantiti digunakan','qty',val(x,'qty'))+field('Kos (RM)','cost',val(x,'cost')||'0','number','step=".01"')+area('Catatan','notes',val(x,'notes'))+formEnd('inputs',x,'Tambah rekod')+`<div class="card">${recordList('inputs',t=>`<strong>${val(t,'type')} · ${val(t,'product')}</strong><small>${val(t,'date')} · ${val(t,'tree')} · ${val(t,'dose')}</small><span>${rm(t.cost)}</span>${t.notes?`<small>${val(t,'notes')}</small>`:''}`)}</div><p class="muted">Ikut arahan label produk dan nasihat pegawai pertanian bagi dos serta kaedah penggunaan.</p>`;
 }
 if(tab==='money'){
  const e=data.expenses.find(t=>String(t.id)===String(editing.expenses)),s=data.sales.find(t=>String(t.id)===String(editing.sales));
  app.innerHTML=formHead('💰 Perbelanjaan','expenses',e)+field('Tarikh','date',val(e,'date')||isoDate(),'date')+selectField('Kategori','category',['Baja','Racun','Upah pekerja','Peralatan','Penyelenggaraan','Pengangkutan','Lain-lain'],e?.category||'Baja')+field('Butiran','details',val(e,'details'),'text','required')+field('Jumlah (RM)','amount',val(e,'amount'),'number','step=".01" required')+formEnd('expenses',e,'Tambah perbelanjaan')+`<div class="card">${recordList('expenses',t=>`<strong>${val(t,'category')} · ${val(t,'details')}</strong><small>${val(t,'date')}</small><b>${rm(t.amount)}</b>`)}</div><hr>`+formHead('🧺 Hasil & jualan','sales',s)+field('Tarikh','date',val(s,'date')||isoDate(),'date')+field('Varieti','variety',val(s,'variety'))+field('Berat (kg)','weight',val(s,'weight'),'number','step=".1"')+field('Harga/kg (RM)','price',val(s,'price'),'number','step=".01"')+field('Pembeli','buyer',val(s,'buyer'))+formEnd('sales',s,'Tambah jualan')+`<div class="card">${recordList('sales',t=>`<strong>${val(t,'variety')} · ${val(t,'weight')} kg</strong><small>${val(t,'date')} · ${val(t,'buyer')}</small><b>${rm(Number(t.weight)*Number(t.price))}</b>`)}</div>`;
 }
 if(tab==='photos'){
  const x=data.photos.find(t=>String(t.id)===String(editing.photos));
  app.innerHTML=formHead('📷 Gambar perkembangan pokok','photos',x)+`<label>Ambil / pilih gambar ${x?'(pilih jika mahu gantikan gambar)':''}</label><input name="image" type="file" accept="image/*" ${x?'':'required'}>`+field('Tarikh','date',val(x,'date')||isoDate(),'date')+field('Kod pokok','tree',val(x,'tree'))+area('Pemerhatian','notes',val(x,'notes'))+formEnd('photos',x,'Tambah gambar')+`<div class="card">${recordList('photos',t=>`<strong>${val(t,'tree')} · ${val(t,'date')}</strong><small>${val(t,'notes')}</small>${t.image?`<img class="photo" src="${t.image}" alt="Foto pokok">`:''}`)}</div>`;
 }
 if(tab==='tasks'){
  const x=data.tasks.find(t=>String(t.id)===String(editing.tasks));
  app.innerHTML=formHead('📅 Jadual kerja kebun','tasks',x)+field('Bulan','month',val(x,'month')||new Date().toISOString().slice(0,7),'month')+field('Aktiviti / kerja','title',val(x,'title'),'text','required')+selectField('Status','done',['Belum selesai','Selesai'],x?.done?'Selesai':'Belum selesai')+formEnd('tasks',x,'Tambah kerja')+`<div class="card">${recordList('tasks',t=>`<strong>${val(t,'title')}</strong><small>${val(t,'month')}</small><span class="tag">${t.done?'Selesai':'Belum selesai'}</span>`)}</div>`;
 }
 if(tab==='backup'){
  app.innerHTML=`<h3>💾 Sandaran & eksport data</h3><div class="card"><p>Sandarkan semua rekod kebun termasuk pokok, baja/racun, kewangan, jualan, foto dan jadual.</p><div class="actions"><button id="backup">Muat turun sandaran penuh (JSON)</button><button class="btn2" id="csv">Eksport senarai pokok (CSV)</button></div><label>Pulihkan sandaran JSON</label><input id="restoreFile" type="file" accept=".json,application/json"><button id="restore" class="btn2">Pulihkan data</button></div><div class="notice">Simpan fail sandaran di Files atau iCloud Drive. Pemulihan akan menggantikan rekod semasa dengan kandungan sandaran.</div>`;
  $('#backup').onclick=()=>download('durian-farm-backup-'+isoDate()+'.json',JSON.stringify({app:'Durian Farm Manager',version:3,exportedAt:new Date().toISOString(),data},null,2),'application/json');
  $('#csv').onclick=()=>{const rows=[['Kod pokok','Varieti','Tarikh tanam','Lokasi','Keadaan','Catatan'],...data.trees.map(x=>[x.code,x.variety,x.planted,x.location,x.status,x.notes])];download('rekod-pokok-durian.csv','\uFEFF'+rows.map(r=>r.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\r\n'),'text/csv;charset=utf-8')};
  $('#restore').onclick=()=>{const file=$('#restoreFile').files[0];if(!file){alert('Pilih fail sandaran JSON dahulu.');return}if(!confirm('Pemulihan akan menggantikan semua rekod semasa. Teruskan hanya jika fail sandaran betul.'))return;const reader=new FileReader();reader.onload=()=>{try{const p=JSON.parse(reader.result);if(!p.data||!keys.every(k=>Array.isArray(p.data[k])))throw Error('format');keys.forEach(k=>{data[k]=p.data[k];save(k)});alert('Sandaran berjaya dipulihkan.');render()}catch{alert('Fail sandaran tidak sah atau tidak lengkap. Tiada data diubah.')}};reader.readAsText(file)};
 }
 app.querySelectorAll('form[data-form]').forEach(f=>f.onsubmit=async e=>{e.preventDefault();const k=f.dataset.form,oldId=f.dataset.id;let x=Object.fromEntries(new FormData(f));if(k==='photos'){const file=f.image.files[0];if(file){x.image=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file)});}else if(oldId){x.image=data.photos.find(p=>String(p.id)===String(oldId))?.image||'';}}
  if(k==='tasks')x.done=x.done==='Selesai';
  if(oldId){const i=data[k].findIndex(t=>String(t.id)===String(oldId));if(i>=0)data[k][i]={...data[k][i],...x,id:data[k][i].id};}
  else{x.id=id();if(k==='trees'&&data.trees.some(t=>String(t.code||'').toUpperCase()===String(x.code||'').toUpperCase())){alert('Kod pokok sudah digunakan.');return}data[k].push(x)}
  save(k);editing[k]=null;render();
 });
 app.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>{editing[b.dataset.edit]=b.dataset.id;render();window.scrollTo(0,0)});
 app.querySelectorAll('[data-cancel]').forEach(b=>b.onclick=()=>{editing[b.dataset.cancel]=null;render()});
 app.querySelectorAll('[data-delete]').forEach(b=>b.onclick=()=>{const k=b.dataset.delete;if(!confirm('Padam rekod ini? Tindakan ini tidak boleh dibatalkan.'))return;data[k]=data[k].filter(x=>String(x.id)!==String(b.dataset.id));save(k);if(String(editing[k])===String(b.dataset.id))editing[k]=null;render()});
}
function download(name,content,type){const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
render();
