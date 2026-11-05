'use strict';

const ICONS = {
  sparkles:'<path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-2-5.8L4 11l6-2.2L12 3Z"/><path d="m19 14 1.1 3.1L23 18l-2.9 1-1.1 3-1-3-3-1 3-1 1-3Z"/>',
  history:'<path d="M3 12a9 9 0 1 0 2.6-6.4L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l3 2"/>',
  lightbulb:'<path d="M9 18h6M10 22h4"/><path d="M8.5 14.5A6 6 0 1 1 15.5 14.5c-.9.7-1.5 1.6-1.5 2.5h-4c0-.9-.6-1.8-1.5-2.5Z"/>',
  'shield-check':'<path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/>',
  menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
  type:'<path d="M4 7V4h16v3M12 4v16M8 20h8"/>',
  link:'<path d="M10 13a5 5 0 0 0 7.1 0l3-3A5 5 0 0 0 13 2.9l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.1 0l-3 3A5 5 0 0 0 11 21.1l1.7-1.7"/>',
  'image-plus':'<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21M16 5h6M19 2v6"/>',
  'arrow-right':'<path d="M5 12h14M12 5l7 7-7 7"/>',
  image:'<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
  x:'<path d="m18 6-12 12M6 6l12 12"/>',
  'check-circle-2':'<path d="M22 11.1V12a10 10 0 1 1-5.9-9.1"/><path d="m9 11 3 3L22 4"/>',
  info:'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  lock:'<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 1 1 8 0v3"/>',
  'cloud-upload':'<path d="M16 16l-4-4-4 4M12 12v9"/><path d="M20 16.5A5.5 5.5 0 0 0 18 6h-1.3A7 7 0 1 0 4 17.3"/>',
  'alert-triangle':'<path d="m10.3 3.9-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3.1l-8-14a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/>',
  'refresh-cw':'<path d="M20 7v5h-5M4 17v-5h5"/><path d="M5.6 9A7 7 0 0 1 18 6l2 6M4 12l2 6a7 7 0 0 0 12.4-3"/>',
  copy:'<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
  download:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
  'wand-sparkles':'<path d="m15 4 5 5M4 20 17 7M6 6l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3ZM18 14l1.2 2.8L22 18l-2.8 1.2L18 22l-1.2-2.8L14 18l2.8-1.2L18 14Z"/>',
  'clock-3':'<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  'trash-2':'<path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6"/>',
  'external-link':'<path d="M15 3h6v6M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  check:'<path d="m5 12 4 4L19 6"/>'
};

document.querySelectorAll('[data-icon]').forEach(el=>{
  const name=el.getAttribute('data-icon');
  if(ICONS[name]) el.innerHTML=`<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[name]}</svg>`;
});

const $ = (id) => document.getElementById(id);
const MAX_FILE_BYTES = 4 * 1024 * 1024;
const HISTORY_KEY = 'prompt-genie-history-v1';
let currentMode = 'text';
let selectedFile = null;
let selectedFileUrl = null;
let currentController = null;
let lastRequest = null;
let toastTimer = null;

const forms = {text:$('textForm'),url:$('urlForm'),upload:$('uploadForm')};
const panels = [...document.querySelectorAll('.mode-panel')];
const resultViews = ['resultEmpty','loadingState','errorState','resultContent'];

function showToast(message, type='success') {
  $('toastText').textContent = message;
  const icon = $('toast').querySelector('.toast-icon');
  icon.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${type==='error'?ICONS['alert-triangle']:ICONS.check}</svg>`;
  icon.style.color = type==='error' ? 'var(--red)' : 'var(--green)';
  $('toast').classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>$('toast').classList.remove('show'),2600);
}

function setMode(mode) {
  if (!forms[mode]) return;
  currentMode = mode;
  document.querySelectorAll('.mode-tab').forEach(tab=>{
    const active=tab.dataset.mode===mode;
    tab.classList.toggle('active',active);
    tab.setAttribute('aria-selected',String(active));
    tab.tabIndex=active?0:-1;
  });
  panels.forEach(panel=>{
    const active=panel.dataset.panel===mode;
    panel.hidden=!active;
    panel.classList.toggle('active',active);
  });
  document.querySelectorAll('.nav-item').forEach(item=>item.classList.toggle('active',item.dataset.nav==='workspace'));
}

document.querySelectorAll('.mode-tab').forEach(tab=>tab.addEventListener('click',()=>setMode(tab.dataset.mode)));
document.querySelectorAll('.example-chip').forEach(chip=>chip.addEventListener('click',()=>{
  $('ideaInput').value=chip.dataset.example;
  updateCharCount();
  $('ideaInput').focus();
}));
$('ideaInput').addEventListener('input',updateCharCount);
function updateCharCount(){ $('charCount').textContent=`${$('ideaInput').value.length.toLocaleString()} / 10,000`; }

$('imageUrlInput').addEventListener('input',()=>{
  const value=$('imageUrlInput').value.trim();
  $('clearUrl').hidden=!value;
  $('urlPreview').hidden=true;
  if(!value) return;
  try {
    const url=new URL(value);
    if(!['http:','https:'].includes(url.protocol)) return;
    $('urlPreviewHost').textContent=url.hostname;
    const img=$('urlPreviewImage');
    img.onload=()=>{$('urlPreview').hidden=false;};
    img.onerror=()=>{$('urlPreview').hidden=true;};
    img.src=value;
  } catch { /* incomplete URL while typing */ }
});
$('clearUrl').addEventListener('click',()=>{$('imageUrlInput').value='';$('imageUrlInput').dispatchEvent(new Event('input'));$('imageUrlInput').focus();});

function formatBytes(bytes){
  if(bytes<1024) return `${bytes} B`;
  if(bytes<1024*1024) return `${(bytes/1024).toFixed(0)} KB`;
  return `${(bytes/(1024*1024)).toFixed(2)} MB`;
}
function clearSelectedFile(){
  selectedFile=null;
  if(selectedFileUrl){URL.revokeObjectURL(selectedFileUrl);selectedFileUrl=null;}
  $('fileInput').value='';
  $('filePreview').hidden=true;
  $('dropzone').hidden=false;
}
function setSelectedFile(file){
  if(!file) return;
  const allowed=['image/jpeg','image/png','image/webp','image/gif'];
  const extension=(file.name.split('.').pop()||'').toLowerCase();
  const allowedExtensions=['jpg','jpeg','png','webp','gif'];
  if(!allowed.includes(file.type) && !allowedExtensions.includes(extension)) {showToast('Choose a PNG, JPG, WEBP or GIF image.', 'error');return;}
  if(file.size>MAX_FILE_BYTES){showToast('This image is larger than 4 MB. Choose a smaller file.','error');return;}
  if(file.size===0){showToast('This image file is empty. Choose another file.','error');return;}
  clearSelectedFile();
  selectedFile=file;
  selectedFileUrl=URL.createObjectURL(file);
  $('filePreviewImage').src=selectedFileUrl;
  $('fileName').textContent=file.name;
  $('fileSize').textContent=formatBytes(file.size);
  $('filePreview').hidden=false;
  $('dropzone').hidden=true;
}
$('fileInput').addEventListener('change',e=>setSelectedFile(e.target.files?.[0]));
$('browseFile').addEventListener('click',e=>{e.stopPropagation();$('fileInput').click();});
$('dropzone').addEventListener('click',e=>{if(e.target!==$('browseFile'))$('fileInput').click();});
$('dropzone').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();$('fileInput').click();}});
$('dropzone').addEventListener('dragover',e=>{e.preventDefault();$('dropzone').classList.add('drag-over');});
$('dropzone').addEventListener('dragleave',()=> $('dropzone').classList.remove('drag-over'));
$('dropzone').addEventListener('drop',e=>{e.preventDefault();$('dropzone').classList.remove('drag-over');setSelectedFile(e.dataTransfer?.files?.[0]);});
$('removeFile').addEventListener('click',clearSelectedFile);

function setResultView(view){
  resultViews.forEach(id=>$(id).hidden=id!==view);
  $('resultStatus').innerHTML = view==='loadingState' ? '<span class="status-dot" style="background:#a38cff"></span> WORKING' : view==='errorState' ? '<span class="status-dot" style="background:var(--red)"></span> ERROR' : view==='resultContent' ? '<span class="status-dot"></span> COMPLETE' : '<span class="status-dot"></span> READY';
  $('resultStatus').style.color=view==='errorState'?'var(--red)':view==='loadingState'?'#b7a8ff':'#78d5b5';
}
function readableResponse(payload, rawText){
  if(typeof payload==='string' && payload.trim()) return payload.trim();
  if(payload && typeof payload==='object'){
    const keys=['prompt','generated_prompt','generatedPrompt','result','output','description','text','message','response','content'];
    for(const key of keys){
      const value=payload[key];
      if(typeof value==='string' && value.trim()) return value.trim();
      if(value && typeof value==='object'){
        if(typeof value.text==='string' && value.text.trim()) return value.text.trim();
        if(typeof value.prompt==='string' && value.prompt.trim()) return value.prompt.trim();
      }
    }
    if(Array.isArray(payload.data)){
      const first=payload.data[0];
      if(typeof first==='string') return first;
      if(first && typeof first==='object'){
        for(const key of keys){if(typeof first[key]==='string'&&first[key].trim())return first[key].trim();}
      }
    }
    return JSON.stringify(payload,null,2);
  }
  return (rawText||'').trim();
}
function safeErrorMessage(status,payload,rawText){
  const detail=payload&&typeof payload==='object' ? (payload.error?.message || payload.error || payload.message || payload.detail) : payload;
  if(status===400||status===422) return typeof detail==='string' ? detail : 'The request was not accepted. Check your input and try again.';
  if(status===401||status===403) return 'The prompt service refused this request. The API may require access or may be temporarily restricted.';
  if(status===404) return 'The prompt service endpoint was not found. Please check the API service URL.';
  if(status===413) return 'The selected image is too large for the server. Try an image under 4 MB.';
  if(status===429) return 'The prompt service is receiving too many requests. Wait a moment, then retry.';
  if(status>=500) return 'The prompt service is temporarily unavailable. Please try again in a little while.';
  if(typeof detail==='string'&&detail.length<240) return detail;
  if(rawText && rawText.length<240 && !rawText.trim().startsWith('<')) return rawText.trim();
  return 'We could not generate your prompt. Please try again.';
}
function setBusy(busy){
  document.querySelectorAll('.generate-button').forEach(button=>{
    button.disabled=busy;
    button.querySelector('.button-label').textContent = busy && button.closest('.mode-panel')?.dataset.panel===currentMode ? 'Generating…' : button.dataset.defaultLabel;
  });
  $('cancelRequest').hidden=!busy;
}
document.querySelectorAll('.generate-button').forEach(button=>button.dataset.defaultLabel=button.querySelector('.button-label').textContent);

async function executeRequest(request){
  if(currentController) currentController.abort();
  currentController=new AbortController();
  const controller=currentController;
  const timeout=setTimeout(()=>controller.abort('timeout'),90000);
  setResultView('loadingState');
  $('retryButton').hidden=false;
  $('errorDetailsButton').textContent='Details';
  $('loadingTitle').textContent=request.mode==='upload'?'Reading your image':'Working on your prompt';
  $('loadingCopy').textContent=request.mode==='text'?'Our genie is turning your idea into something special.':'Looking closely at the image and finding the details that matter.';
  setBusy(true);
  $('errorDetails').hidden=true;
  try{
    let response;
    if(request.mode==='text'){
      response=await fetch('/api/prompt/text',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json, text/plain'},body:JSON.stringify({text:request.text}),signal:controller.signal});
    } else if(request.mode==='url'){
      response=await fetch('/api/prompt/image-url',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json, text/plain'},body:JSON.stringify({image_url:request.image_url}),signal:controller.signal});
    } else {
      const body=new FormData();body.append('image',request.file,request.file.name);body.append('text',request.text);
      response=await fetch('/api/prompt/image',{method:'POST',headers:{'Accept':'application/json, text/plain'},body,signal:controller.signal});
    }
    const rawText=await response.text();
    let payload=null;
    if(rawText){try{payload=JSON.parse(rawText);}catch{payload=rawText;}}
    if(!response.ok){
      const message=safeErrorMessage(response.status,payload,rawText);
      const error=new Error(message);error.status=response.status;error.detail=typeof payload==='string'?payload:JSON.stringify(payload,null,2);throw error;
    }
    const output=readableResponse(payload,rawText);
    if(!output){throw new Error('The API returned an empty response. Please try again.');}
    $('promptOutput').textContent=output;
    $('resultTime').textContent=new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
    $('copyLabel').textContent='Copy prompt';
    setResultView('resultContent');
    addHistory({mode:request.mode,inputLabel:request.inputLabel,output,createdAt:Date.now()});
    $('resultPanel').scrollIntoView({behavior:'smooth',block:'nearest'});
  }catch(error){
    const aborted=error.name==='AbortError'||controller.signal.aborted;
    $('errorTitle').textContent=aborted?'Request cancelled':'Something didn’t work';
    $('errorMessage').textContent=aborted?(controller.signal.reason==='timeout'?'The request took too long. Check the connection and try again.':'The request was cancelled.'):(error.message||'An unexpected network error occurred.');
    const detail=error.detail || (error instanceof TypeError ? 'A network connection problem occurred. Check your internet connection and make sure this site is deployed on Vercel so the /api proxy is available.' : error.stack||'No additional details available.');
    $('errorDetails').textContent=String(detail).slice(0,5000);
    $('retryButton').hidden=aborted&&controller.signal.reason!=='timeout';
    setResultView('errorState');
  }finally{
    clearTimeout(timeout);
    if(currentController===controller)currentController=null;
    setBusy(false);
  }
}

forms.text.addEventListener('submit',e=>{
  e.preventDefault();const text=$('ideaInput').value.trim();
  if(!text){$('ideaInput').focus();showToast('Write a short idea first.','error');return;}
  const request={mode:'text',text,inputLabel:text.slice(0,95)};lastRequest=request;executeRequest(request);
});
forms.url.addEventListener('submit',e=>{
  e.preventDefault();const value=$('imageUrlInput').value.trim();
  if(!value){$('imageUrlInput').focus();showToast('Paste an image URL first.','error');return;}
  let parsed;try{parsed=new URL(value);}catch{$('imageUrlInput').focus();showToast('That link does not look like a valid URL.','error');return;}
  if(!['http:','https:'].includes(parsed.protocol)){showToast('Only HTTP and HTTPS image links are supported.','error');return;}
  const request={mode:'url',image_url:parsed.href,inputLabel:parsed.hostname};lastRequest=request;executeRequest(request);
});
forms.upload.addEventListener('submit',e=>{
  e.preventDefault();if(!selectedFile){showToast('Choose an image to upload first.','error');return;}
  const instruction=$('imageInstruction').value.trim()||'Generate a same image like this';
  const request={mode:'upload',file:selectedFile,text:instruction,inputLabel:selectedFile.name};lastRequest=request;executeRequest(request);
});
$('cancelRequest').addEventListener('click',()=>{if(currentController)currentController.abort('cancelled');});
$('retryButton').addEventListener('click',()=>{if(lastRequest)executeRequest(lastRequest);});
$('errorDetailsButton').addEventListener('click',()=>{
  const details=$('errorDetails');details.hidden=!details.hidden;$('errorDetailsButton').textContent=details.hidden?'Details':'Hide details';
});

async function copyText(text){
  try{
    if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(text);}
    else{
      const temp=document.createElement('textarea');temp.value=text;temp.style.position='fixed';temp.style.opacity='0';document.body.appendChild(temp);temp.select();
      const ok=document.execCommand('copy');temp.remove();if(!ok)throw new Error('Clipboard unavailable');
    }
    showToast('Prompt copied to clipboard');return true;
  }catch{showToast('Could not copy automatically. Select the prompt and copy it manually.','error');return false;}
}
$('copyButton').addEventListener('click',async()=>{
  const ok=await copyText($('promptOutput').textContent);
  if(ok){$('copyLabel').textContent='Copied!';setTimeout(()=>$('copyLabel').textContent='Copy prompt',1800);}
});
$('downloadButton').addEventListener('click',()=>{
  const text=$('promptOutput').textContent;if(!text)return;
  const blob=new Blob([text],{type:'text/plain;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`prompt-genie-${new Date().toISOString().slice(0,10)}.txt`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);showToast('Prompt saved as a text file');
});

function readHistory(){
  try{const parsed=JSON.parse(localStorage.getItem(HISTORY_KEY)||'[]');return Array.isArray(parsed)?parsed.filter(x=>x&&typeof x.output==='string').slice(0,10):[];}catch{return [];}
}
let historyItems=readHistory();
function persistHistory(){try{localStorage.setItem(HISTORY_KEY,JSON.stringify(historyItems.slice(0,10)));}catch{showToast('Browser storage is full. Clear some history to save new items.','error');}}
function addHistory(item){
  const record={id:`${item.createdAt}-${Math.random().toString(36).slice(2,7)}`,...item};
  historyItems=[record,...historyItems].slice(0,10);persistHistory();renderHistory();
}
function renderHistory(){
  const list=$('historyList');list.replaceChildren();
  $('clearHistory').hidden=historyItems.length===0;
  if(!historyItems.length){const empty=document.createElement('div');empty.className='history-empty';empty.innerHTML=`<svg viewBox="0 0 24 24">${ICONS['clock-3']}</svg><span>Your generated prompts will appear here.</span>`;list.appendChild(empty);return;}
  historyItems.forEach(item=>{
    const row=document.createElement('div');row.className='history-item';
    const icon=document.createElement('div');icon.className='history-type-icon';icon.innerHTML=`<svg viewBox="0 0 24 24">${item.mode==='text'?ICONS.type:item.mode==='url'?ICONS.image:ICONS['image-plus']}</svg>`;
    const copy=document.createElement('div');copy.className='history-copy';
    const title=document.createElement('strong');title.textContent=item.inputLabel||'Generated prompt';
    const meta=document.createElement('span');meta.textContent=`${item.mode==='text'?'Text idea':item.mode==='url'?'Image URL':'Image upload'} · ${new Date(item.createdAt).toLocaleString()}`;
    copy.append(title,meta);
    const actions=document.createElement('div');actions.className='history-item-actions';
    const view=document.createElement('button');view.type='button';view.className='history-action';view.title='View prompt';view.setAttribute('aria-label','View prompt');view.innerHTML=`<svg viewBox="0 0 24 24"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>`;view.addEventListener('click',()=>{ $('promptOutput').textContent=item.output;$('resultTime').textContent=new Date(item.createdAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});setResultView('resultContent');$('resultPanel').scrollIntoView({behavior:'smooth',block:'center'});});
    const copyBtn=document.createElement('button');copyBtn.type='button';copyBtn.className='history-action';copyBtn.title='Copy prompt';copyBtn.setAttribute('aria-label','Copy prompt');copyBtn.innerHTML=`<svg viewBox="0 0 24 24">${ICONS.copy}</svg>`;copyBtn.addEventListener('click',()=>copyText(item.output));
    actions.append(view,copyBtn);row.append(icon,copy,actions);list.appendChild(row);
  });
}
$('clearHistory').addEventListener('click',()=>{
  if(!historyItems.length)return;
  historyItems=[];persistHistory();renderHistory();showToast('Recent prompts cleared');
});
document.querySelectorAll('.nav-item').forEach(item=>item.addEventListener('click',()=>{
  if(item.dataset.nav==='history'){$('historySection').scrollIntoView({behavior:'smooth',block:'start'});document.querySelectorAll('.nav-item').forEach(n=>n.classList.toggle('active',n===item));}
  else{setMode(currentMode);window.scrollTo({top:0,behavior:'smooth'});}
  if(window.innerWidth<=850)closeMobileNav();
}));

function closeMobileNav(){
  document.querySelector('.sidebar').classList.remove('open');
  const backdrop=document.querySelector('.mobile-backdrop');if(backdrop)backdrop.classList.remove('show');
  $('mobileMenu').setAttribute('aria-expanded','false');
}
$('mobileMenu').addEventListener('click',()=>{
  const sidebar=document.querySelector('.sidebar');const opening=!sidebar.classList.contains('open');sidebar.classList.toggle('open',opening);$('mobileMenu').setAttribute('aria-expanded',String(opening));
  let backdrop=document.querySelector('.mobile-backdrop');if(!backdrop){backdrop=document.createElement('div');backdrop.className='mobile-backdrop';document.body.appendChild(backdrop);backdrop.addEventListener('click',closeMobileNav);}backdrop.classList.toggle('show',opening);
});
window.addEventListener('keydown',e=>{if(e.key==='Escape')closeMobileNav();});
window.addEventListener('beforeunload',()=>{if(selectedFileUrl)URL.revokeObjectURL(selectedFileUrl);if(currentController)currentController.abort();});
$('year').textContent=new Date().getFullYear();
renderHistory();
