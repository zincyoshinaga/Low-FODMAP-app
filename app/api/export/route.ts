import {GET as diaryRecords} from '@/app/api/diary/route';
import {reportCsv,type RangeData} from '@/lib/diary';
import {recordDate,json} from '@/lib/api-validation';
export const dynamic='force-dynamic';
export async function GET(request:Request){
 const url=new URL(request.url);const from=recordDate.safeParse(url.searchParams.get('from'));const to=recordDate.safeParse(url.searchParams.get('to'));
 if(!from.success||!to.success||url.searchParams.has('date'))return json({error:'出力する日付範囲を指定してください。'},400);
 const response=await diaryRecords(request);if(!response.ok)return response;
 const data=await response.json() as RangeData;const name='おなかノート_'+from.data+'_'+to.data+'.csv';
 return new Response(reportCsv(data),{headers:{'Content-Type':'text/csv;charset=utf-8','Content-Disposition':'attachment; filename="onaka-note_'+from.data+'_'+to.data+'.csv"; filename*=UTF-8\'\''+encodeURIComponent(name),'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
}
