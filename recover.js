const SUPABASE_URL='https://nnpydavlkfzbpwetyclf.supabase.co';
const PUBLISHABLE_KEY='sb_publishable_KhQWXpXZkGpifkSYiFspaQ_Ja6V1Nec';
const REDIRECT_URL=new URL('./recover.html',location.href).origin+new URL('./recover.html',location.href).pathname;
const $=id=>document.getElementById(id);
const sections=['request','new-password','complete'];
let client=null, loading=false, finished=false;
const hash=new URLSearchParams(location.hash.replace(/^#/,''));
const query=new URLSearchParams(location.search);
const isRecoveryReturn=hash.get('type')==='recovery'||query.get('type')==='recovery';
function message(text,isError=false){
 const el=$('status');el.textContent=text;el.classList.toggle('error',isError);
}
function show(which){
 for(const s of sections)$(s).classList.toggle('hide',s!==which);
}
function busy(value){
 loading=value;
 for(const id of ['send','save','verify-link'])$(id).disabled=value;
}
async function enterNewPassword(){
 show('new-password');
 message('Your account is verified for password recovery. Enter your new password below.');
 // Remove one-time tokens from the address bar after Supabase has read them.
 try{history.replaceState({},'',REDIRECT_URL)}catch{}
}
async function requestReset(event){
 event.preventDefault();if(!client||loading)return;
 const email=String($('email').value||'').trim();if(!email)return;
 busy(true);
 try{
  const result=await client.auth.resetPasswordForEmail(email,{redirectTo:REDIRECT_URL});
  if(result.error)throw result.error;
  message('If this email has a Roavely account, a reset email was requested. Check Inbox, Updates and Spam. Open the latest recovery link.');
 }catch(e){message('Could not request an email: '+String(e?.message||e),true)}
 finally{busy(false)}
}
async function setNewPassword(event){
 event.preventDefault();if(!client||loading)return;
 const password=$('password').value,confirm=$('again').value;
 if(password.length<12){message('Please choose a password with at least 12 characters.',true);return}
 if(password!==confirm){message('The two passwords do not match.',true);return}
 busy(true);
 try{
  const result=await client.auth.updateUser({password});
  if(result.error)throw result.error;
  finished=true;show('complete');$('password').value='';$('again').value='';
  message('Password successfully changed. Your Roavely account and administrator role are unchanged.');
 }catch(e){message('Password was not updated: '+String(e?.message||e),true)}
 finally{busy(false)}
}
async function useOriginalLink(event){
 event.preventDefault();if(!client||loading)return;
 const input=$('original-link');let target;
 try{target=new URL(input.value.trim())}
 catch{message('Paste the full original recovery email link.',true);return}
 if(target.protocol!=='https:'||target.hostname!=='nnpydavlkfzbpwetyclf.supabase.co'||target.pathname!=='/auth/v1/verify'||target.searchParams.get('type')!=='recovery'){
   message('This is not a Roavely Supabase password recovery link. Copy the original link from the newest reset email.',true);return
 }
 const token=target.searchParams.get('token_hash')||target.searchParams.get('token');
 if(!token){message('The link has no recovery token. Copy the complete original link.',true);return}
 busy(true);
 try{
  const result=await client.auth.verifyOtp({token_hash:token,type:'recovery'});
  if(result.error)throw result.error;
  input.value='';
  await enterNewPassword();
  $('fallback').open=false;
 }catch(e){message('That reset link could not be verified: '+String(e?.message||e)+'. Request a new reset email and copy the newest link.',true)}
 finally{busy(false)}
}
$('request-form').addEventListener('submit',requestReset);
$('change-form').addEventListener('submit',setNewPassword);
$('link-form').addEventListener('submit',useOriginalLink);
async function boot(){
 try{
  const sdk=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.57.0/+esm');
  client=sdk.createClient(SUPABASE_URL,PUBLISHABLE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:'implicit'}});
  client.auth.onAuthStateChange((event,session)=>{
   if(finished)return;
   if(event==='PASSWORD_RECOVERY'&&session){void enterNewPassword()}
  });
  const {data,error}=await client.auth.getSession();
  if(error)throw error;
  if(data?.session){
   await enterNewPassword();
  }else{
   show('request');
   const errorDescription=hash.get('error_description')||query.get('error_description');
   if(errorDescription)message('The reset link was rejected: '+errorDescription.replace(/\+/g,' ')+'. Request a new link below.',true);
   else message(isRecoveryReturn?'The recovery link did not establish a session. Request a fresh email or use the original-link option below.':'Enter your account email below to start.');
  }
 }catch(e){show('request');message('Could not load secure account recovery: '+String(e?.message||e),true)}
}
void boot();