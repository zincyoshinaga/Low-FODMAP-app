import {getChatGPTUser} from '@/app/chatgpt-auth';
import {rawDb} from '@/db/raw';
import {canonicalFoodName,foodKey,commonFoods,foodCategories} from '@/lib/food-picker';
import {z} from 'zod';
export const dynamic='force-dynamic';
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
const inputSchema=z.object({name:z.string().trim().min(1).max(60).refine(s=>!/[、,，\n\r]/.test(s),'食材名は一つずつ入力してください'),category:z.string().refine(s=>foodCategories.some(c=>c.id===s))});
export async function GET(){
 const user=await getChatGPTUser();if(!user)return json({error:'自分の食材を保存するにはサインインしてください。'},401);
 try{const data=await rawDb().prepare('SELECT id,name,category FROM user_foods WHERE user_id = ? ORDER BY created_at,name').bind(user.userId).all();return json({foods:data.results});}
 catch{console.error('User foods read unavailable');return json({error:'保存した食材を読み込めません。時間をおいて再度お試しください。'},503)}
}
export async function POST(request:Request){
 const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return json({error:'この画面から追加してください。'},403);
 if(!request.headers.get('content-type')?.includes('application/json'))return json({error:'入力形式を確認してください。'},415);
 const user=await getChatGPTUser();if(!user)return json({error:'自分の食材を保存するにはサインインしてください。'},401);
 if(Number(request.headers.get('content-length')??0)>2000)return json({error:'入力が長すぎます。'},413);
 let parsed;try{parsed=inputSchema.safeParse(await request.json())}catch{return json({error:'食材名とグループを確認してください。'},400)}
 if(!parsed.success)return json({error:'食材名を一つだけ入力し、グループを選んでください。'},400);
 const name=canonicalFoodName(parsed.data.name);const key=foodKey(name);
 if(!key)return json({error:'食材名を入力してください。'},400);
 if(commonFoods.some(f=>foodKey(f.name)===key))return json({error:'この食材はすでに選択肢にあります。'},409);
 try{const db=rawDb();const id=crypto.randomUUID();
 const inserted=await db.prepare('INSERT INTO user_foods (id,user_id,name,name_key,category,created_at) VALUES (?,?,?,?,?,?) ON CONFLICT(user_id,name_key) DO NOTHING').bind(id,user.userId,name,key,parsed.data.category,new Date().toISOString()).run();
 if(!inserted.meta.changes)return json({error:'この食材はすでに保存されています。'},409);
 return json({food:{id,name,category:parsed.data.category}},201);
 }catch{console.error('User food save unavailable');return json({error:'食材を保存できませんでした。入力内容は残っています。再度お試しください。'},503)}
}
