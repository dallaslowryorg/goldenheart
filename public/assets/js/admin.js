const state={dogs:[],editing:null};
const $=s=>document.querySelector(s);
const list=$('#dog-list'),dialog=$('#dog-dialog'),form=$('#dog-form'),alertBox=$('#admin-alert'),search=$('#dog-search');

function showAlert(message=''){
  alertBox.hidden=!message;
  alertBox.textContent=message;
}
function imageSrc(image){
  if(!image) return '';
  return image.startsWith('/') ? image : `/assets/images/dogs/${image}`;
}
function esc(value=''){return String(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function groupLabel(group){return ({available:'Available',pending:'Pending',matched:'Matched / Transitioning',partner:'Veteran Organization Placement',graduate:'Graduate'})[group]||group;}

function syncDogFields(){
  const group=form.elements.group.value;
  const showProgress=['available','pending','matched'].includes(group);
  const showYear=group==='graduate';
  const showLocation=group==='graduate';
  const progressField=$('#progress-field'),yearField=$('#year-field'),locationField=$('#location-field');
  if(progressField) progressField.hidden=!showProgress;
  if(yearField) yearField.hidden=!showYear;
  if(locationField) locationField.hidden=!showLocation;
  if(!showProgress) form.elements.progress.value='';
  if(!showYear) form.elements.year.value='';
}

async function api(path,options={}){
  const response=await fetch(path,{headers:{'Accept':'application/json',...(options.body instanceof FormData?{}:{'Content-Type':'application/json'}),...(options.headers||{})},...options});
  const payload=await response.json().catch(()=>({}));
  if(!response.ok){
    const detail=payload.detail?`: ${payload.detail}`:'';
    throw new Error((payload.error||`Request failed (${response.status})`)+detail);
  }
  return payload;
}

async function load(){
  try{
    const [me,data]=await Promise.all([api('/api/admin/me'),api('/api/admin/dogs')]);
    $('#admin-user').textContent=me.email||me.name||'Signed in';
    state.dogs=data.dogs||[];
    render();
  }catch(err){
    list.innerHTML='';
    showAlert(err.message+' If this is the first deployment, finish the Cloudflare Access and D1 setup steps in ADMIN-SETUP.md.');
  }
}

function render(){
  const q=search.value.trim().toLowerCase();
  const dogs=state.dogs.filter(d=>!q||[d.name,d.handlerName,d.location,d.status,d.group,...(d.specialties||[])].filter(Boolean).join(' ').toLowerCase().includes(q));
  $('#dog-total').textContent=`${state.dogs.length} dog${state.dogs.length===1?'':'s'}`;
  if(!dogs.length){list.innerHTML='<p class="loading">No dogs match that search.</p>';return;}
  list.innerHTML=dogs.map(d=>`<article class="admin-card" data-id="${d.id}">
    ${d.image?`<img src="${esc(imageSrc(d.image))}" alt="">`:'<div class="no-thumb">No photo</div>'}
    <div><h2>${esc(d.name)}</h2><span class="status-pill">${esc(groupLabel(d.group))}</span><p>${esc([d.age,d.sex,d.group==='graduate'?d.location:null].filter(Boolean).join(' • '))}</p>${d.handlerName?`<p><strong>Handler:</strong> ${esc(d.handlerName)}</p>`:''}<p>${d.visible===false?'Hidden from public site':esc(d.status||'')}</p></div>
    <button class="button edit" type="button" data-edit="${d.id}">Edit</button>
  </article>`).join('');
}

function setPhoto(image){
  const preview=$('#photo-preview'),empty=$('#photo-empty');
  form.elements.image.value=image||'';
  if(image){preview.src=imageSrc(image);preview.hidden=false;empty.hidden=true;}else{preview.removeAttribute('src');preview.hidden=true;empty.hidden=false;}
}

function openDog(dog=null){
  state.editing=dog;
  form.reset();
  form.elements.id.value=dog?.id||'';
  form.elements.name.value=dog?.name||'';
  form.elements.handlerName.value=dog?.handlerName||'';
  form.elements.sex.value=dog?.sex||'';
  form.elements.age.value=dog?.age||'';
  form.elements.location.value=dog?.location||'';
  form.elements.group.value=dog?.group||'available';
  form.elements.progress.value=dog?.progress||'';
  form.elements.year.value=dog?.year||'';
  form.elements.specialties.value=(dog?.specialties||[]).join('\n');
  form.elements.blurb.value=dog?.blurb||'';
  form.elements.veteranPlacement.checked=Boolean(dog?.veteranPlacement);
  form.elements.visible.checked=dog?.visible!==false;
  $('#photo-file').value='';
  setPhoto(dog?.image||'');
  $('#dialog-title').textContent=dog?`Edit ${dog.name}`:'Add Dog';
  $('#delete-dog').hidden=!dog;
  syncDogFields();
  dialog.showModal();
}

async function prepareImage(file){
  if(!file || !file.type.startsWith('image/')) return file;
  if(file.type==='image/gif') return file;
  try{
    const bitmap=await createImageBitmap(file);
    const max=1600,scale=Math.min(1,max/Math.max(bitmap.width,bitmap.height));
    const w=Math.round(bitmap.width*scale),h=Math.round(bitmap.height*scale);
    const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
    canvas.getContext('2d',{alpha:false}).drawImage(bitmap,0,0,w,h);
    bitmap.close?.();
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',.86));
    if(!blob) return file;
    return new File([blob],file.name.replace(/\.[^.]+$/,'')+'.webp',{type:'image/webp'});
  }catch{return file;}
}

async function uploadSelectedPhoto(){
  const input=$('#photo-file');
  if(!input.files?.[0]) return form.elements.image.value;
  $('#save-status').textContent='Optimizing photo…';
  const file=await prepareImage(input.files[0]);
  const data=new FormData();data.append('file',file);
  $('#save-status').textContent='Uploading photo…';
  const result=await api('/api/admin/upload',{method:'POST',body:data});
  return result.image;
}

form.addEventListener('submit',async e=>{
  e.preventDefault();showAlert('');
  const save=$('#save-dog');save.disabled=true;
  try{
    const image=await uploadSelectedPhoto();
    const data=Object.fromEntries(new FormData(form));
    data.image=image||'';
    data.veteranPlacement=form.elements.veteranPlacement.checked;
    data.visible=form.elements.visible.checked;
    data.specialties=form.elements.specialties.value;
    const id=form.elements.id.value;
    $('#save-status').textContent='Saving…';
    const result=await api(id?`/api/admin/dogs/${id}`:'/api/admin/dogs',{method:id?'PUT':'POST',body:JSON.stringify(data)});
    if(id){const i=state.dogs.findIndex(d=>d.id===Number(id));if(i>=0)state.dogs[i]=result.dog;}else state.dogs.push(result.dog);
    state.dogs.sort((a,b)=>(a.sortOrder-b.sortOrder)||a.name.localeCompare(b.name));
    render();dialog.close();$('#save-status').textContent='Saved';setTimeout(()=>$('#save-status').textContent='',1800);
  }catch(err){showAlert(err.message);$('#save-status').textContent='';}
  finally{save.disabled=false;}
});

$('#delete-dog').addEventListener('click',async()=>{
  const dog=state.editing;if(!dog) return;
  if(!confirm(`Delete ${dog.name}? This removes the profile from the live directory and cannot be undone from the admin panel.`)) return;
  const btn=$('#delete-dog');btn.disabled=true;
  try{await api(`/api/admin/dogs/${dog.id}`,{method:'DELETE'});state.dogs=state.dogs.filter(d=>d.id!==dog.id);render();dialog.close();}
  catch(err){showAlert(err.message);}finally{btn.disabled=false;}
});

$('#add-dog').addEventListener('click',()=>openDog());
list.addEventListener('click',e=>{const id=Number(e.target.closest('[data-edit]')?.dataset.edit);if(id)openDog(state.dogs.find(d=>d.id===id));});
search.addEventListener('input',render);
$('#close-dialog').addEventListener('click',()=>dialog.close());
$('#cancel-dialog').addEventListener('click',()=>dialog.close());
$('#clear-photo').addEventListener('click',()=>{setPhoto('');$('#photo-file').value='';});
$('#photo-file').addEventListener('change',()=>{const file=$('#photo-file').files?.[0];if(file){const url=URL.createObjectURL(file);$('#photo-preview').src=url;$('#photo-preview').hidden=false;$('#photo-empty').hidden=true;}});
form.elements.group.addEventListener('change',syncDogFields);
dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
load();
