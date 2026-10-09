export type Meal={id:string;date:string;time:string;kind:string;food:string;amount:string;deleted_at?:string|null};
export type DailySymptoms={date:string;pain:number|null;bloating:number|null;stool:number|null;stress:number|null;sleep:number|null;bowel_count:number|null;urgency:number|null;note:string};
export type SymptomEvent={id:string;date:string;time:string;pain:number|null;bloating:number|null;stool:number|null;urgency:number|null;note:string;deleted_at?:string|null};
export type DiaryData={meals:Meal[];symptoms:DailySymptoms|null;events:SymptomEvent[];deletedMeals:Meal[];deletedEvents:SymptomEvent[]};
export type RangeData={meals:Meal[];days:DailySymptoms[];events:SymptomEvent[]};
export type MealTransfer={token:string;food:string;amount:string};
export const japanToday=()=>new Date(Date.now()+9*3600000).toISOString().slice(0,10);
export const japanTime=()=>new Intl.DateTimeFormat('ja-JP',{timeZone:'Asia/Tokyo',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date());
export function dateOffset(date:string,days:number){const d=new Date(date+'T00:00:00Z');d.setUTCDate(d.getUTCDate()+days);return d.toISOString().slice(0,10)}
export function calendarRange(date:string,period:'week'|'month'){if(period==='week')return {from:dateOffset(date,-6),to:date};const start=date.slice(0,7)+'-01';const next=new Date(start+'T00:00:00Z');next.setUTCMonth(next.getUTCMonth()+1);return {from:start,to:dateOffset(next.toISOString().slice(0,10),-1)}}
export function csvCell(value:unknown){let text=String(value??'');if(/^[\s]*[=+\-@]/.test(text))text="'"+text;return '"'+text.replace(/"/g,'""')+'"'}
export function reportCsv(data:RangeData){
 const rows:unknown[][]=[['日付','時刻','種類','食事・症状','量','腹痛','膨満感','便形状','切迫感','ストレス','睡眠時間','排便回数','メモ']];
 for(const m of data.meals)rows.push([m.date,m.time,m.kind,m.food,m.amount,'','','','','','','','']);
 for(const e of data.events)rows.push([e.date,e.time,'症状・排便','', '',e.pain,e.bloating,e.stool,e.urgency,'','','',e.note]);
 for(const d of data.days)rows.push([d.date,'','一日の体調','','',d.pain,d.bloating,d.stool,d.urgency,d.stress,d.sleep,d.bowel_count,d.note]);
 return '\ufeff'+[rows[0],...rows.slice(1).sort((a,b)=>(String(a[0])+String(a[1])).localeCompare(String(b[0])+String(b[1])))].map(row=>row.map(csvCell).join(',')).join('\r\n');
}
