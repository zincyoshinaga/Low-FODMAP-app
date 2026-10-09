import {z} from 'zod';
export const recordDate=z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(s=>{const d=new Date(s+'T00:00:00Z');return !isNaN(d.getTime())&&d.toISOString().slice(0,10)===s});
export const recordTime=z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
export const score=z.number().int().min(0).max(10).nullable();
export const urgency=z.number().int().min(0).max(3).nullable();
export const stool=z.number().int().min(1).max(7).nullable();
export const json=(v:unknown,status=200)=>Response.json(v,{status,headers:{'Cache-Control':'no-store'}});
export function mutationGuard(request:Request){const origin=request.headers.get('origin');if((origin&&origin!==new URL(request.url).origin)||request.headers.get('sec-fetch-site')==='cross-site')return json({error:'この画面から操作してください。'},403);if(!request.headers.get('content-type')?.includes('application/json'))return json({error:'入力形式を確認してください。'},415);if(Number(request.headers.get('content-length')??0)>15000)return json({error:'入力が長すぎます。'},413)}
