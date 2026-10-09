import {spawn} from 'node:child_process';
import {mkdirSync,openSync,closeSync,readFileSync,renameSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import net from 'node:net';

const root=fileURLToPath(new URL('../',import.meta.url));
const url='http://127.0.0.1:5173/';
async function ready(){
 try{const response=await fetch(url,{signal:AbortSignal.timeout(3000)});const html=await response.text();return response.ok&&html.includes('おなかノート')}
 catch{return false}
}
async function portInUse(){return new Promise(resolve=>{const socket=net.createConnection({host:'127.0.0.1',port:5173});socket.setTimeout(1500);socket.once('connect',()=>{socket.destroy();resolve(true)});socket.once('error',()=>{socket.destroy();resolve(false)});socket.once('timeout',()=>{socket.destroy();resolve(false)})})}
async function main(){
if(await ready()){console.log('おなかノートは起動しています。'+url);return}
if(await portInUse())throw new Error('起動先が使用中、または準備中です。少し待ってからもう一度お試しください。');
const state=path.join(root,'.sites-runtime');mkdirSync(state,{recursive:true});
// A stopped preview can leave a stale PID, which Windows may later reuse.
// Preserve that file only after the exact local port is confirmed unused.
const lockFile=path.join(root,'.vinext','dev','lock.json');
try{
 const lock=JSON.parse(readFileSync(lockFile,'utf8'));
 if(path.resolve(lock.cwd)===path.resolve(root)&&lock.port===5173&&lock.hostname==='127.0.0.1'&&Date.now()-lock.startedAt>120000){
  renameSync(lockFile,path.join(state,'preview-lock-backup-'+Date.now()+'.json'));
 }
}catch(error){if(error.code!=='ENOENT')throw new Error('起動情報を確認できませんでした。'+error.message)}
const logFile=path.join(state,'preview.log');const descriptor=openSync(logFile,'a');
const child=spawn(process.execPath,['scripts/run-framework.mjs','dev','--hostname','127.0.0.1'],{
 cwd:root,detached:true,windowsHide:true,stdio:['ignore',descriptor,descriptor],
 env:{...process.env,CLOUDFLARE_CF_FETCH_ENABLED:'false',WRANGLER_SEND_METRICS:'false'},
});
let failure;child.once('error',error=>{failure=error});child.once('exit',code=>{failure=new Error('起動処理が終了しました。確認用ログ：'+logFile+'（終了番号 '+code+'）')});child.unref();closeSync(descriptor);
for(let attempt=0;attempt<30;attempt++){
 if(failure)throw new Error('起動できませんでした。'+failure.message);
 if(await ready()){console.log('おなかノートを起動しました。'+url);return}
 await new Promise(resolve=>setTimeout(resolve,1000));
}
throw new Error('起動を確認できませんでした。確認用ログ：'+logFile);
}
await main().catch(error=>{console.error(error.message);process.exitCode=1});
