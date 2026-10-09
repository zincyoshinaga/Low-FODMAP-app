'use client';
import {useState} from 'react';
import {Select,SelectTrigger,SelectValue,SelectContent,SelectItem} from '@/components/ui/select';
import {portionsFor,assessPortion} from '@/lib/portions';
import {labels,type Result} from '@/lib/foods';
export default function PortionInfo({result,onRecord}:{result:Result;onRecord:(food:string,amount:string)=>void}){
 const name=result.food?.name??result.input;const refs=portionsFor(name);const [variant,setVariant]=useState('');const [grams,setGrams]=useState(result.amount?.match(/^(\d+(?:\.\d+)?)\s*(?:g|グラム)$/i)?.[1]??'');
 const assessment=assessPortion(name,variant,grams?Number(grams):null);const ref=assessment.reference;
 return <div className="portion-info"><h4>一食量の確認</h4>{refs.length?<><label>種類・部位を選ぶ<Select value={variant} onValueChange={setVariant}><SelectTrigger className="category-select"><SelectValue placeholder="種類・部位を確認して選択"/></SelectTrigger><SelectContent>{refs.map(r=><SelectItem value={r.id} key={r.id}>{r.variant}</SelectItem>)}</SelectContent></Select></label><label>食べる量（g）<input type="number" min="0.1" max="10000" step="0.1" value={grams} onChange={e=>setGrams(e.target.value)} placeholder="例：75"/></label>{ref&&<><p>収録例：<strong>{ref.grams}g · {labels[ref.status]}</strong></p><p className="small">{ref.processing}</p><a href={ref.sourceUrl} target="_blank" rel="noreferrer">量の出典（{ref.published}公開／{ref.checked}確認）</a></>}<p className={'quantity-status '+assessment.status}>{grams&&variant&&assessment.status!=='unknown'?'入力量は公開資料の収録例と一致しています。':grams?'入力した量の評価：未確認':'入力量：未指定'}</p><p className="small">75gは収録された一食の例です。上限量ではありません。他の量や料理全体の合計は推測しません。</p></>:<p className="small">この食材の量別データは未収録です。食品の分類と、入力した量の評価は別です。</p>}<button type="button" className="secondary-button" onClick={()=>onRecord(name,grams?name+' '+grams+'g':result.amount??'')}>この食材を食事に記録</button></div>
}
