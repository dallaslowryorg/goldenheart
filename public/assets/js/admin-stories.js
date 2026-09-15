const state={stories:[],editing:null};
const $=s=>document.querySelector(s);
const list=$('#story-list'),dialog=$('#story-dialog'),form=$('#story-form'),alertBox=$('#admin-alert'),search=$('#story-search');

function showAlert(message=''){alertBox.hidden=!message;alertBox.textContent=message;}
function esc(value=''){return String(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function assetSrc(value){return value||'';}

async function api(path,options={}){
  const response=await fetch(path,{headers:{'Accept':'application/json',...(options.body instanceof FormData?{}:{'Content-Type':'application/json'}),...(options.headers||{})},...options});
  const payload=await response.json().catch(()=>({}));
  if(!response.ok){const detail=payload.detail?`: ${payload.detail}`:'';throw new Error((payload.error||`Request failed (${response.status})`)+detail);}
  return payload;
}

async function load(){
  try{
    const [me,data]=await Promise.all([api('/api/admin/me'),api('/api/admin/stories')]);
    $('#admin-user').textContent=me.email||me.name||'Signed in';
    state.stories=data.stories||[];
    render();
  }catch(err){list.innerHTML='';showAlert(err.message);}
}

function render(){
  const q=search.value.trim().toLowerCase();
  const stories=state.stories.filter(s=>!q||[s.title,s.quote,s.body,s.attribution,...(s.tags||[])].filter(Boolean).join(' ').toLowerCase().includes(q));
  $('#story-total').textContent=`${state.stories.length} stor${state.stories.length===1?'y':'ies'}`;
  if(!stories.length){list.innerHTML='<p class="loading">No stories match that search.</p>';return;}
  list.innerHTML=stories.map(s=>`<article class="admin-card story-admin-card" data-id="${s.id}">
    ${s.image?`<img src="${esc(assetSrc(s.image))}" alt="">`:'<div class="no-thumb">No photo</div>'}
    <div><h2>${esc(s.title)}</h2><span class="status-pill">${s.visible===false?'Hidden':'Public'}</span><p>${esc((s.tags||[]).join(' • '))}</p><p>${esc(s.quote||'No highlight quote')}</p></div>
    <button class="button edit" type="button" data-edit="${s.id}">Edit</button>
  </article>`).join('');
}

function setPhoto(image){
  const preview=$('#photo-preview'),empty=$('#photo-empty');
  form.elements.image.value=image||'';
  if(image){preview.src=assetSrc(image);preview.hidden=false;empty.hidden=true;}else{preview.removeAttribute('src');preview.hidden=true;empty.hidden=false;}
}
function setVideo(video){
  const preview=$('#video-preview'),empty=$('#video-empty');
  form.elements.video.value=video||'';
  if(video){preview.src=assetSrc(video);preview.hidden=false;empty.hidden=true;}else{preview.removeAttribute('src');preview.hidden=true;empty.hidden=false;}
}

function openStory(story=null){
  state.editing=story;form.reset();
  form.elements.id.value=story?.id||'';
  form.elements.title.value=story?.title||'';
  form.elements.tags.value=(story?.tags||[]).join('\n');
  form.elements.quote.value=story?.quote||'';
  form.elements.body.value=story?.body||'';
  form.elements.attribution.value=story?.attribution||'';
  form.elements.imageAlt.value=story?.imageAlt||'';
  form.elements.videoNote.value=story?.videoNote||'';
  form.elements.sortOrder.value=story?.sortOrder??100;
  form.elements.collapseBody.checked=story?.collapseBody!==false;
  form.elements.visible.checked=story?.visible!==false;
  $('#photo-file').value='';$('#video-file').value='';
  setPhoto(story?.image||'');setVideo(story?.video||'');
  $('#dialog-title').textContent=story?`Edit ${story.title}`:'Add Story';
  $('#delete-story').hidden=!story;
  dialog.showModal();
}

async function prepareImage(file){
  if(!file || !file.type.startsWith('image/')) return file;
  if(file.type==='image/gif') return file;
  try{
    const bitmap=await createImageBitmap(file);const max=1800,scale=Math.min(1,max/Math.max(bitmap.width,bitmap.height));
    const w=Math.round(bitmap.width*scale),h=Math.round(bitmap.height*scale);const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
    canvas.getContext('2d',{alpha:false}).drawImage(bitmap,0,0,w,h);bitmap.close?.();
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',.88));if(!blob)return file;
    return new File([blob],file.name.replace(/\.[^.]+$/,'')+'.webp',{type:'image/webp'});
  }catch{return file;}
}

async function uploadAsset(input,kind='image'){
  if(!input.files?.[0]) return kind==='image'?form.elements.image.value:form.elements.video.value;
  let file=input.files[0];
  if(kind==='image'){ $('#save-status').textContent='Optimizing photo…'; file=await prepareImage(file); }
  $('#save-status').textContent=`Uploading ${kind}…`;
  const data=new FormData();data.append('file',file);data.append('kind','stories');
  const result=await api('/api/admin/upload',{method:'POST',body:data});
  return result.asset||result.image;
}

form.addEventListener('submit',async e=>{
  e.preventDefault();showAlert('');const save=$('#save-story');save.disabled=true;
  try{
    const image=await uploadAsset($('#photo-file'),'image');
    const video=await uploadAsset($('#video-file'),'video');
    const data=Object.fromEntries(new FormData(form));
    data.image=image||'';data.video=video||'';data.collapseBody=form.elements.collapseBody.checked;data.visible=form.elements.visible.checked;data.sortOrder=Number(data.sortOrder||100);data.tags=form.elements.tags.value;
    const id=form.elements.id.value;$('#save-status').textContent='Saving…';
    const result=await api(id?`/api/admin/stories/${id}`:'/api/admin/stories',{method:id?'PUT':'POST',body:JSON.stringify(data)});
    if(id){const i=state.stories.findIndex(s=>s.id===Number(id));if(i>=0)state.stories[i]=result.story;}else state.stories.push(result.story);
    state.stories.sort((a,b)=>(a.sortOrder-b.sortOrder)||a.title.localeCompare(b.title));render();dialog.close();$('#save-status').textContent='Saved';setTimeout(()=>$('#save-status').textContent='',1800);
  }catch(err){showAlert(err.message);$('#save-status').textContent='';}finally{save.disabled=false;}
});

$('#delete-story').addEventListener('click',async()=>{
  const story=state.editing;if(!story)return;
  if(!confirm(`Delete ${story.title}? This removes the story from the live site and cannot be undone from the admin panel.`))return;
  const btn=$('#delete-story');btn.disabled=true;
  try{await api(`/api/admin/stories/${story.id}`,{method:'DELETE'});state.stories=state.stories.filter(s=>s.id!==story.id);render();dialog.close();}
  catch(err){showAlert(err.message);}finally{btn.disabled=false;}
});

$('#add-story').addEventListener('click',()=>openStory());
list.addEventListener('click',e=>{const id=Number(e.target.closest('[data-edit]')?.dataset.edit);if(id)openStory(state.stories.find(s=>s.id===id));});
search.addEventListener('input',render);
$('#close-dialog').addEventListener('click',()=>dialog.close());
$('#cancel-dialog').addEventListener('click',()=>dialog.close());
$('#clear-photo').addEventListener('click',()=>{setPhoto('');$('#photo-file').value='';});
$('#clear-video').addEventListener('click',()=>{setVideo('');$('#video-file').value='';});
$('#photo-file').addEventListener('change',()=>{const file=$('#photo-file').files?.[0];if(file){const url=URL.createObjectURL(file);$('#photo-preview').src=url;$('#photo-preview').hidden=false;$('#photo-empty').hidden=true;}});
$('#video-file').addEventListener('change',()=>{const file=$('#video-file').files?.[0];if(file){const url=URL.createObjectURL(file);$('#video-preview').src=url;$('#video-preview').hidden=false;$('#video-empty').hidden=true;}});
dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
load();
