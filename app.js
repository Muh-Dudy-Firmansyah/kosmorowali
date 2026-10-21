const SUPABASE_URL = "https://jnqtsywzxefhgfniaioe.supabase.co"
const SUPABASE_KEY = "sb_publishable_IqNfytat9WZgYzysZbQXFQ_LKEu3BMN"
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
})

let allKos = []
let currentUser = null

document.addEventListener('DOMContentLoaded', async ()=>{ 
  const { data } = await supabaseClient.auth.getSession()
  currentUser = data.session?.user || null
  renderUser()
  loadKos(); 
  loadPatungan(); 
  supabaseClient.auth.onAuthStateChange((e, session)=>{
    currentUser = session?.user || null
    renderUser()
  })
});

// ===== LOGIN SYSTEM - SILENT & PRO =====
function renderUser(){
  let el = document.getElementById('userArea')
  if(!el){
    el = document.createElement('div')
    el.id = 'userArea'
    el.className = 'fixed top-3 right-3 z-[998]'
    document.body.appendChild(el)
  }
  // Kalo belum login -> HILANG, biar gak ganggu yang cuma scroll
  if(!currentUser){
    el.innerHTML = ''
    el.classList.add('hidden')
    return
  }
  // Kalo udah login -> Muncul foto profil asli Google/FB
  el.classList.remove('hidden')
  const avatar = currentUser.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.email}`
  const name = currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'User'
  el.innerHTML = `<div class="flex items-center gap-2 bg-white shadow-md px-2.5 py-1.5 rounded-full border"><img src="${avatar}" class="w-7 h-7 rounded-full object-cover"><span class="text-[12px] font-bold truncate max-w-[80px]">${name}</span><button onclick="logout()" class="text-[11px] text-red-500 ml-1 font-bold">×</button></div>`
}

function bukaPopupLogin(){
  const el = document.getElementById('popupKos')
  el.classList.remove('hidden')
  el.innerHTML = `
  <div class="fixed inset-0 bg-black/60 z-[999] flex justify-center items-center p-4" onclick="tutupPopup()">
    <div class="bg-white w-full max-w-[340px] rounded-[20px] p-6" onclick="event.stopPropagation()">
      <div class="text-center mb-5">
        <b class="text-[16px]">Login dulu bro</b>
        <p class="text-[12px] text-gray-500 mt-1">Biar bisa daftar kos & jadi host patungan.<br>Sekali login, besok tetep login.</p>
      </div>
      <button onclick="loginWithGoogle()" class="w-full border border-gray-300 py-3 rounded-xl text-[13px] font-bold mb-3 flex items-center justify-center gap-2.5 hover:bg-gray-50 transition">
        <img src="https://www.svgrepo.com/show/475656/google-color.svg" class="w-5 h-5"> Login dengan Google
      </button>
      <button onclick="loginWithFacebook()" class="w-full bg-[#1877F2] text-white py-3 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2.5 hover:bg-[#166fe5] transition">
        <svg class="w-5 h-5 fill-white" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> Login dengan Facebook
      </button>
      <button onclick="tutupPopup()" class="w-full bg-gray-100 py-2.5 rounded-xl text-[13px] mt-4 font-bold">Nanti aja</button>
    </div>
  </div>`
}

async function loginWithGoogle(){ await supabaseClient.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.href } }) }
async function loginWithFacebook(){ await supabaseClient.auth.signInWithOAuth({ provider: 'facebook', options: { redirectTo: window.location.href } }) }
async function logout(){ await supabaseClient.auth.signOut(); currentUser=null; renderUser(); tutupPopup() }

async function loadKos(){
  let dbData=[]
  try{
    const {data} = await supabaseClient.from('kos_listing').select('*').eq('status','approved').order('created_at',{ascending:false})
    if(data) dbData=data
  }catch(e){}
  const dariDB = dbData.map(k=>({ 
    id:k.id, nama:k.nama, lokasi:k.lokasi, km:k.km||'', harga:k.harga, alamat:k.alamat||'', kontak:k.kontak||k.wa, wa:k.kontak||k.wa,
    foto1:k.foto?.[0]||k.foto1||'', foto2:k.foto?.[1]||k.foto2||'', foto3:k.foto?.[2]||k.foto3||'',
    foto:k.foto?.[0]||k.foto1||'', gambar:k.foto?.[0]||k.foto1||'', maps:k.maps||'', fasilitas:k.fasilitas, deskripsi:k.deskripsi
  }))
  const dariManual = (typeof dataKos!=='undefined'? dataKos : []).map(k=>({ 
    ...k, 
    foto1:k.foto?.[0]||k.foto1||'', foto2:k.foto?.[1]||k.foto2||'', foto3:k.foto?.[2]||k.foto3||'',
    foto:k.foto?.[0]||k.foto1||'', gambar:k.foto?.[0]||'', kontak:k.kontak||k.wa, wa:k.wa||k.kontak
  }))
  allKos=[...dariDB,...dariManual]
  renderKos(allKos)
}

function renderKos(list){
  const grid=document.getElementById('kosGrid')
  if(!grid) return
  if(!list || list.length===0){ grid.innerHTML='<div class="col-span-3 text-center py-10 text-[13px] text-gray-400">Kos tidak ditemukan</div>'; return }
  grid.innerHTML=list.map(k=>`
  <div class="bg-white rounded-xl border overflow-hidden shadow-sm">
    <div class="grid grid-cols-3 grid-rows-2 gap-[2px] h-[180px] bg-gray-100">
      <div class="col-span-2 row-span-2"><img src="${k.foto1||k.foto||'https://via.placeholder.com/300'}" class="w-full h-full object-cover" loading="lazy"></div>
      <div class="col-span-1 row-span-1"><img src="${k.foto2||k.foto1||k.foto||'https://via.placeholder.com/300'}" class="w-full h-full object-cover" loading="lazy"></div>
      <div class="col-span-1 row-span-1"><img src="${k.foto3||k.foto1||k.foto||'https://via.placeholder.com/300'}" class="w-full h-full object-cover" loading="lazy"></div>
    </div>
    <div class="p-3">
      <h3 class="font-bold text-[13px] truncate">${k.nama}</h3>
      <p class="text-[11px] text-gray-500">${k.lokasi} • ${k.km||''}</p>
      <p class="text-[11px] text-gray-400 truncate">${k.alamat||''}</p>
      <p class="font-bold text-[12px] mt-1">${k.harga==0?'Hubungi':'Rp '+Number(k.harga).toLocaleString('id-ID')}</p>
      <div class="flex gap-2 mt-2">
        <a href="https://wa.me/${(k.kontak||k.wa||'').toString().replace(/[^0-9]/g,'')}" target="_blank" class="flex-1 bg-green-800 text-white text-center text-[11px] py-2 rounded-lg">Chat WA</a>
        ${k.maps?`<a href="${k.maps}" target="_blank" class="px-5 bg-white border border-blue-500 text-blue-600 text-[11px] py-2 rounded-lg">📍 Maps</a>`:''}
      </div>
    </div>
  </div>`).join('')
}

function filterKos(){
  const q=(document.getElementById('searchLocation')?.value||'').toLowerCase()
  const km=document.getElementById('searchKM')?.value||'all'
  let f=[...allKos]
  if(q) f=f.filter(k=>(k.nama+k.lokasi+(k.alamat||'')).toLowerCase().includes(q))
  if(km!=='all') f=f.filter(k=>(k.km||'').toLowerCase().includes(km))
  renderKos(f)
}
function tutupPopup(){ document.getElementById('popupPatungan')?.classList.add('hidden'); document.getElementById('popupKos')?.classList.add('hidden'); }
function tutupPopupPatungan(){ tutupPopup() }
function tutupPopupKos(){ tutupPopup() }

// ===== PATUNGAN =====
function bukaPopupPatungan(){
  const el=document.getElementById('popupPatungan')
  el.classList.remove('hidden')
  el.innerHTML=`<div class="fixed inset-0 bg-black/60 z-[999] flex justify-center items-end md:items-center p-0 md:p-4" onclick="tutupPopup()">
  <div class="bg-white w-full md:max-w-[480px] rounded-t-2xl md:rounded-xl p-5 max-h-[90vh] overflow-auto" onclick="event.stopPropagation()">
    <div class="flex justify-between mb-4"><b class="text-[14px]">Cari Teman Patungan</b><button onclick="tutupPopup()" class="text-xl">×</button></div>
    <div class="flex gap-2 mb-4">
      <button type="button" onclick="setTabPatungan('host')" id="tab_host" class="flex-1 bg-[#facc15] py-2 rounded-full font-bold text-[12px]">Saya Punya Kos (HOST)</button>
      <button type="button" onclick="setTabPatungan('cari')" id="tab_guest" class="flex-1 bg-gray-100 py-2 rounded-full font-bold text-[12px]">Saya Cari Kos (GUEST)</button>
    </div>
    <div id="formHostWrap">
      <form onsubmit="handlePatungan(event)" class="flex flex-col gap-3">
        <input type="hidden" id="p_tipe" value="host">
        <input id="p_nama_user" required placeholder="Nama Kamu" class="border p-2.5 rounded-lg text-[13px]">
        <input id="p_nama" required placeholder="Nama Kos Kamu (ex: Kos Mawar)" class="border p-2.5 rounded-lg text-[13px]">
        <input id="p_lokasi" required list="listDesaHost" placeholder="Tulis Desa/Kec, cth: Bunta, Fatufia, Labota..." class="border p-2.5 rounded-lg text-[13px]">
        <input id="p_harga" required placeholder="Harga Patungan (ex: 500rb/orang)" class="border p-2.5 rounded-lg text-[13px]">
        <input id="p_wa" required placeholder="WA 628xxx" class="border p-2.5 rounded-lg text-[13px]">
        <textarea id="p_desc" placeholder="Butuh 1 orang lagi, kos cewek/cowok, dll" class="border p-2.5 rounded-lg text-[13px]"></textarea>
        <button class="bg-black text-white py-3 rounded-xl font-bold text-[13px]">Posting Patungan</button>
      </form>
    </div>
    <div id="formGuestWrap" class="hidden">
      <select id="filterGuestLokasi" onchange="renderGuestList()" class="w-full border p-2.5 rounded-lg text-[13px] bg-white mb-3">
        <option value="semua">Semua Lokasi</option>
        <option value="bahodopi">Bahodopi</option><option value="fatufia">Fatufia</option><option value="keurea">Keurea</option><option value="imip">IMIP</option><option value="bunta">Bunta</option>
      </select>
      <div id="guestList" class="flex flex-col gap-2 max-h-[50vh] overflow-auto"></div>
    </div>
    <button type="button" onclick="tutupPopup()" class="w-full bg-gray-100 py-2.5 rounded-xl text-[13px] mt-3">Tutup</button>
  </div></div>`
  renderGuestList()
}

function bukaPopupKos(){
  if(!currentUser){ bukaPopupLogin(); return }
  const el = document.getElementById('popupKos');
  el.classList.remove('hidden');
  el.innerHTML = `
  <div class="fixed inset-0 bg-black/60 z-[999] flex justify-center items-end md:items-center p-0 md:p-4" onclick="tutupPopup()">
    <div class="bg-white w-full md:max-w-[480px] rounded-t-2xl md:rounded-xl p-5 max-h-[90vh] overflow-auto" onclick="event.stopPropagation()">
      <div class="flex justify-between mb-4"><b class="text-[14px]">Daftarkan Kos Gratis</b><button onclick="tutupPopup()" class="text-xl">×</button></div>
      <form onsubmit="handleKosSubmit(event)" class="flex flex-col gap-3">
        <input id="k_nama" required placeholder="Nama Kos" class="border p-2.5 rounded-lg text-[13px]">
        <input id="k_lokasi" required placeholder="Lokasi/Desa: Bunta, Fatufia, Labota..." class="border p-2.5 rounded-lg text-[13px]">
        <input id="k_alamat" required placeholder="Alamat Lengkap: PPR Blok B9/5, dekat Alfamidi" class="border p-2.5 rounded-lg text-[13px]">
        <input id="k_maps" placeholder="Link Google Maps (opsional)" class="border p-2.5 rounded-lg text-[13px]">
        <small class="text-[11px] text-gray-400 -mt-2">Kosongin aja kalo gak ada, gak wajib</small>
        <input id="k_harga" type="number" required placeholder="Harga/bulan" class="border p-2.5 rounded-lg text-[13px]">
        <input id="k_wa" required placeholder="WA 628xxx" class="border p-2.5 rounded-lg text-[13px]">
        <textarea id="k_desc" placeholder="Deskripsi, fasilitas: KM dalam, Free WiFi..." class="border p-2.5 rounded-lg text-[13px]"></textarea>
        <label class="text-[12px] font-bold mt-2">Foto 1 (Utama) Wajib</label>
        <input id="k_foto1" type="file" accept="image/*" required class="border p-2 rounded-lg text-[12px]" onchange="previewFoto(this,'prev1')">
        <img id="prev1" class="hidden w-full h-32 object-cover rounded-lg">
        <label class="text-[12px] font-bold">Foto 2</label>
        <input id="k_foto2" type="file" accept="image/*" class="border p-2 rounded-lg text-[12px]" onchange="previewFoto(this,'prev2')">
        <img id="prev2" class="hidden w-full h-32 object-cover rounded-lg">
        <label class="text-[12px] font-bold">Foto 3</label>
        <input id="k_foto3" type="file" accept="image/*" class="border p-2 rounded-lg text-[12px]" onchange="previewFoto(this,'prev3')">
        <img id="prev3" class="hidden w-full h-32 object-cover rounded-lg">
        <button id="btnSubmitKos" class="bg-black text-white py-3 rounded-xl font-bold text-[13px] mt-2">Daftarkan Sekarang</button>
      </form>
    </div>
  </div>`;
}

function previewFoto(input, prevId){
  const file = input.files[0]
  if(!file) return
  const img = document.getElementById(prevId)
  img.src = URL.createObjectURL(file)
  img.classList.remove('hidden')
}

async function handleKosSubmit(e){
  e.preventDefault()
  const btn = document.getElementById('btnSubmitKos')
  btn.disabled=true; btn.innerText='Uploading...'
  try{
    const files = [document.getElementById('k_foto1').files[0], document.getElementById('k_foto2').files[0], document.getElementById('k_foto3').files[0]].filter(Boolean)
    let urls=[]
    for(let i=0;i<files.length;i++){
      const file = files[i]
      const name = `${currentUser.id}/${Date.now()}_${i}_${file.name}`
      const { error } = await supabaseClient.storage.from('kos-foto').upload(name, file)
      if(error) throw error
      const { data } = supabaseClient.storage.from('kos-foto').getPublicUrl(name)
      urls.push(data.publicUrl)
    }
    const payload = {
      nama: document.getElementById('k_nama').value,
      lokasi: document.getElementById('k_lokasi').value,
      alamat: document.getElementById('k_alamat').value,
      maps: document.getElementById('k_maps').value || '',
      harga: parseInt(document.getElementById('k_harga').value)||0,
      kontak: document.getElementById('k_wa').value,
      deskripsi: document.getElementById('k_desc').value,
      fasilitas: [document.getElementById('k_desc').value],
      foto: urls,
      foto1: urls[0]||'', foto2: urls[1]||'', foto3: urls[2]||'',
      km: 'dalam',
      status: 'pending',
      user_id: currentUser.id
    }
    const { error } = await supabaseClient.from('kos_listing').insert(payload)
    if(error) throw error
    alert('Berhasil! Menunggu approval admin.')
    tutupPopup()
  }catch(err){ alert('Gagal: '+err.message) } finally { btn.disabled=false; btn.innerText='Daftarkan Sekarang' }
}

function setTabPatungan(tab){
  const isGuest = tab==='cari' || tab==='guest'
  const hostWrap=document.getElementById('formHostWrap')
  const guestWrap=document.getElementById('formGuestWrap')
  const h=document.getElementById('tab_host'), g=document.getElementById('tab_guest')
  const tipe=document.getElementById('p_tipe')
  if(tipe) tipe.value=isGuest?'cari':'host'
  if(isGuest){
    hostWrap?.classList.add('hidden'); guestWrap?.classList.remove('hidden')
    g?.classList.add('bg-[#facc15]'); g?.classList.remove('bg-gray-100')
    h?.classList.remove('bg-[#facc15]'); h?.classList.add('bg-gray-100')
    renderGuestList()
  } else {
    guestWrap?.classList.add('hidden'); hostWrap?.classList.remove('hidden')
    h?.classList.add('bg-[#facc15]'); h?.classList.remove('bg-gray-100')
    g?.classList.remove('bg-[#facc15]'); g?.classList.add('bg-gray-100')
  }
}

async function renderGuestList(){
  const container=document.getElementById('guestList')
  const filter=document.getElementById('filterGuestLokasi')?.value || 'semua'
  if(!container) return
  container.innerHTML='<div class="text-center py-6 text-[12px] text-gray-400">Loading...</div>'
  try{
    let query = supabaseClient.from('patungan').select('*').eq('tipe','host').order('created_at',{ascending:false}).limit(30)
    const {data} = await query
    let list = data || []
    if(filter!=='semua') list = list.filter(p=> (p.lokasi||'').toLowerCase().includes(filter))
    if(list.length===0){ container.innerHTML=`<div class="text-center py-8 text-[12px] text-gray-400">Belum ada HOST di ${filter}.<br>Coba lokasi lain.</div>`; return }
    container.innerHTML = list.map(p=>`
      <div class="border rounded-xl p-3 bg-gray-50">
        <div class="flex justify-between items-start"><b class="text-[12px]">${p.nama_kos||'Kos'}</b><span class="text-[10px] bg-white border px-2 py-0.5 rounded-full">${p.lokasi}</span></div>
        <div class="text-[11px] text-gray-600 mt-1">${p.nama_user||''} • ${p.harga||''}</div>
        <div class="text-[11px] text-gray-500 mt-1 line-clamp-2">${p.deskripsi||''}</div>
        <a href="https://wa.me/${(p.wa+'').replace(/[^0-9]/g,'')}" target="_blank" class="mt-2 block bg-[#22c55e] text-white text-center text-[11px] font-bold py-2 rounded-lg">💬 Chat WA Host</a>
      </div>
    `).join('')
  }catch(e){ container.innerHTML='<div class="text-center text-[12px] text-red-400">Gagal load</div>' }
}

async function loadPatungan(){}

async function handlePatungan(e){
  e.preventDefault();
  if(!currentUser){ bukaPopupLogin(); return }
  const wa=document.getElementById('p_wa').value;
  const payload={ tipe:'host', nama_user:document.getElementById('p_nama_user').value, nama_kos:document.getElementById('p_nama').value, lokasi:document.getElementById('p_lokasi').value, harga:document.getElementById('p_harga').value, wa:wa, deskripsi:document.getElementById('p_desc').value, user_id: currentUser.id };
  const {error}=await supabaseClient.from('patungan').insert(payload);
  if(error) alert(error.message); else { alert('Patungan posted!'); tutupPopup(); renderGuestList(); }
}