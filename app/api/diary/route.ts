import {getChatGPTUser} from '@/app/chatgpt-auth';
import {rawDb} from '@/db/raw';
import {z} from 'zod';
import {recordDate,recordTime,score,stool,urgency,json,mutationGuard} from '@/lib/api-validation';
export const dynamic='force-dynamic';
const meal=z.object({type:z.literal('meal'),id:z.string().uuid(),date:recordDate,time:recordTime,kind:z.enum(['朝食','昼食','夕食','間食']),food:z.string().trim().min(1).max(2000),amount:z.string().max(300)});
const event=z.object({type:z.literal('event'),id:z.string().uuid(),date:recordDate,time:recordTime,pain:score,bloating:score,stool,urgency,note:z.string().max(2000)}).refine(v=>[v.pain,v.bloating,v.stool,v.urgency].some(x=>x!==null)||!!v.note.trim());
const daily=z.object({type:z.literal('symptoms'),id:z.string().uuid(),date:recordDate,pain:score,bloating:score,stress:score,stool,sleep:z.number().min(0).max(24).nullable(),bowelCount:z.number().int().min(0).max(50).nullable().optional(),urgency:urgency.optional(),note:z.string().max(2000)}).refine(v=>[v.pain,v.bloating,v.stress,v.stool,v.sleep,v.bowelCount,v.urgency].some(x=>x!=null)||!!v.note.trim());
const body=z.union([meal,event,daily]);
export async function GET(request:Request){
 const user=await getChatGPTUser();if(!user)return json({error:'記録の利用にはサインインが必要です。'},401);
 const url=new URL(request.url);const day=url.searchParams.get('date');const range=day===null;
 const from=recordDate.safeParse(range?url.searchParams.get('from'):day);const to=recordDate.safeParse(range?url.searchParams.get('to'):day);
 if(!from.success||!to.success||from.data>to.data||(Date.parse(to.data)-Date.parse(from.data))/86400000>61)return json({error:'62日以内の日付範囲を指定してください。'},400);
 try{const db=rawDb();const [m,s,e]=await Promise.all([
  db.prepare('SELECT id,date,time,kind,food,amount,deleted_at FROM meals WHERE user_id=? AND date BETWEEN ? AND ?'+(range?' AND deleted_at IS NULL':'')+' ORDER BY date,time,created_at').bind(user.userId,from.data,to.data).all(),
  db.prepare('SELECT date,pain,bloating,stool,stress,sleep,bowel_count,urgency,note FROM symptoms WHERE user_id=? AND date BETWEEN ? AND ? ORDER BY date').bind(user.userId,from.data,to.data).all(),
  db.prepare('SELECT id,date,time,pain,bloating,stool,urgency,note,deleted_at FROM symptom_events WHERE user_id=? AND date BETWEEN ? AND ?'+(range?' AND deleted_at IS NULL':'')+' ORDER BY date,time,created_at').bind(user.userId,from.data,to.data).all()
 ]);
 if(range)return json({meals:m.results,days:s.results,events:e.results});
 return json({meals:m.results.filter(v=>!v.deleted_at),symptoms:s.results[0]??null,events:e.results.filter(v=>!v.deleted_at),deletedMeals:m.results.filter(v=>v.deleted_at),deletedEvents:e.results.filter(v=>v.deleted_at)});
 }catch{return json({error:'記録を読み込めません。時間をおいて再度お試しください。'},503)}
}
async function readMutation(request:Request){const invalid=mutationGuard(request);if(invalid)return {response:invalid};const user=await getChatGPTUser();if(!user)return {response:json({error:'記録の利用にはサインインが必要です。'},401)};try{return {user,data:await request.json()}}catch{return {response:json({error:'入力を確認してください。'},400)}}}
export async function POST(request:Request){
 const ctx=await readMutation(request);if(ctx.response)return ctx.response;const parsed=body.safeParse(ctx.data);if(!parsed.success)return json({error:'日付・時刻・数値・入力内容を確認してください。'},400);
 const user=ctx.user!;const v=parsed.data;const now=new Date().toISOString();
 try{const db=rawDb();if(v.type==='meal')await db.prepare('INSERT INTO meals (id,user_id,date,time,kind,food,amount,created_at) VALUES (?,?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING').bind(v.id,user.userId,v.date,v.time,v.kind,v.food,v.amount,now).run();
 else if(v.type==='event')await db.prepare('INSERT INTO symptom_events (id,user_id,date,time,pain,bloating,stool,urgency,note,created_at) VALUES (?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING').bind(v.id,user.userId,v.date,v.time,v.pain,v.bloating,v.stool,v.urgency,v.note,now).run();
 else await db.prepare('INSERT INTO symptoms (id,user_id,date,pain,bloating,stool,stress,sleep,bowel_count,urgency,note,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(user_id,date) DO UPDATE SET pain=excluded.pain,bloating=excluded.bloating,stool=excluded.stool,stress=excluded.stress,sleep=excluded.sleep,bowel_count=excluded.bowel_count,urgency=excluded.urgency,note=excluded.note,updated_at=excluded.updated_at').bind(v.id,user.userId,v.date,v.pain,v.bloating,v.stool,v.stress,v.sleep,v.bowelCount??null,v.urgency??null,v.note,now).run();
 return json({saved:true})}catch{return json({error:'保存できませんでした。入力内容は残っています。'},503)}
}
export async function PATCH(request:Request){
 const ctx=await readMutation(request);if(ctx.response)return ctx.response;const user=ctx.user!;
 const restore=z.object({type:z.enum(['meal','event']),id:z.string().uuid(),action:z.literal('restore')}).strict().safeParse(ctx.data);
 try{const db=rawDb();if(restore.success){const table=restore.data.type==='meal'?'meals':'symptom_events';const r=await db.prepare('UPDATE '+table+' SET deleted_at=NULL WHERE id=? AND user_id=? AND deleted_at IS NOT NULL').bind(restore.data.id,user.userId).run();return r.meta.changes?json({saved:true}):json({error:'記録が見つかりません。'},404)}
 const parsed=z.union([meal,event]).safeParse(ctx.data);if(!parsed.success)return json({error:'入力内容を確認してください。'},400);const v=parsed.data;
 const result=v.type==='meal'?await db.prepare('UPDATE meals SET date=?,time=?,kind=?,food=?,amount=? WHERE id=? AND user_id=? AND deleted_at IS NULL').bind(v.date,v.time,v.kind,v.food,v.amount,v.id,user.userId).run():await db.prepare('UPDATE symptom_events SET date=?,time=?,pain=?,bloating=?,stool=?,urgency=?,note=? WHERE id=? AND user_id=? AND deleted_at IS NULL').bind(v.date,v.time,v.pain,v.bloating,v.stool,v.urgency,v.note,v.id,user.userId).run();
 return result.meta.changes?json({saved:true}):json({error:'記録が見つかりません。'},404);
 }catch{return json({error:'記録を更新できませんでした。'},503)}
}
export async function DELETE(request:Request){
 const ctx=await readMutation(request);if(ctx.response)return ctx.response;const parsed=z.object({type:z.enum(['meal','event']),id:z.string().uuid()}).strict().safeParse(ctx.data);if(!parsed.success)return json({error:'記録を確認してください。'},400);
 try{const table=parsed.data.type==='meal'?'meals':'symptom_events';const result=await rawDb().prepare('UPDATE '+table+' SET deleted_at=? WHERE id=? AND user_id=? AND deleted_at IS NULL').bind(new Date().toISOString(),parsed.data.id,ctx.user!.userId).run();return result.meta.changes?json({saved:true}):json({error:'記録が見つかりません。'},404)}catch{return json({error:'記録を削除できませんでした。'},503)}
}
