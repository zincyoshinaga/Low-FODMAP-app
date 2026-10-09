'use client';
import {useState,useEffect,useRef} from 'react';
import {registerTool} from '@/lib/webmcp';
import {ChefHat,Clock} from 'lucide-react';
import {Tabs,TabsList,TabsTrigger,TabsContent} from '@/components/ui/tabs';
import FoodPicker from './food-picker-ui';
import {usePreferences} from './preferences-ui';
import {materialText,foodKey} from '@/lib/food-picker';
import {suggestRecipes,recipes} from '@/lib/recipes';
import {source} from '@/lib/foods';
export default function Recipes({onRecord,onActivate}:{onRecord:(food:string,amount:string)=>void;onActivate:()=>void}){
 const prefs=usePreferences();const initialized=useRef(false);const dirty=useRef(false);
 const [wanted,setWanted]=useState<string[]>([]);const [wantedManual,setWantedManual]=useState('');
 const [preferred,setPreferred]=useState<string[]>([]);const [preferredManual,setPreferredManual]=useState('');
 const [excluded,setExcluded]=useState<string[]>(['玉ねぎ','にんにく']);const [excludedManual,setExcludedManual]=useState('');
 const [notice,setNotice]=useState('');const [applied,setApplied]=useState({wanted:'',excluded:'玉ねぎ、にんにく',preferred:''});
 useEffect(()=>{if(!prefs.loading&&!initialized.current){initialized.current=true;if(!dirty.current){setExcluded(prefs.excluded);setApplied(v=>({...v,excluded:materialText(prefs.excluded,'')}))}}},[prefs.loading,prefs.excluded]);
 const wantedText=materialText(wanted,wantedManual);const excludedText=materialText(excluded,excludedManual);const preferredText=materialText(preferred,preferredManual);
 const pending=wantedText!==applied.wanted||excludedText!==applied.excluded||preferredText!==applied.preferred;
 const found=suggestRecipes(applied.excluded,applied.wanted,applied.preferred);
 const conditionName=(s:string)=>s.replace(/\s*\d+(?:\.\d+)?\s*(?:g|グラム|ml|個|枚|杯)\s*$/i,'');
 const excludedKeys=new Set(excludedText.split('、').filter(Boolean).map(s=>foodKey(conditionName(s))));
 const conflicts=wantedText.split('、').filter(s=>s&&excludedKeys.has(foodKey(conditionName(s))));
 useEffect(()=>registerTool({name:'configure_recipe_exclusions',title:'使う食材・除外材料から献立を提案',description:'必須の食材と除外条件を守り、希望の食材を多く含む順に献立案を表示します。保存はしません。',inputSchema:{type:'object',properties:{excluded:{type:'string',maxLength:2000},wanted:{type:'string',maxLength:2000},preferred:{type:'string',maxLength:2000}},required:['excluded'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input){const v=input as {excluded?:unknown;wanted?:unknown;preferred?:unknown};if(typeof v?.excluded!=='string'||v.excluded.length>2000||['wanted','preferred'].some(k=>v[k as 'wanted']!==undefined&&(typeof v[k as 'wanted']!=='string'||String(v[k as 'wanted']).length>2000)))throw new Error('食材の条件を確認してください');onActivate();dirty.current=true;const required=typeof v.wanted==='string'?v.wanted:'';const prefer=typeof v.preferred==='string'?v.preferred:'';setExcluded([]);setExcludedManual(v.excluded);setWanted([]);setWantedManual(required);setPreferred([]);setPreferredManual(prefer);setApplied({excluded:materialText([],v.excluded),wanted:materialText([],required),preferred:materialText([],prefer)});const result=suggestRecipes(v.excluded,required,prefer);return {count:result.length,titles:result.map(r=>r.title)}}}),[]);
 return <div className="workspace"><section className="panel">
 <div className="panel-heading"><span className="section-number">02</span><div><h2>使いたい食材から、献立を考える</h2><p>必須の材料と除外条件を守り、希望に近い献立から提案します。</p></div></div>
 <form onSubmit={e=>{e.preventDefault();setApplied({wanted:wantedText,excluded:excludedText,preferred:preferredText})}}>
 <Tabs defaultValue="wanted"><TabsList className="recipe-condition-tabs" aria-label="献立の食材条件"><TabsTrigger value="wanted">必ず使う</TabsTrigger><TabsTrigger value="preferred">できれば使う</TabsTrigger><TabsTrigger value="excluded">避けたい</TabsTrigger></TabsList>
 <TabsContent value="wanted" forceMount className="preserved-tab"><FoodPicker mode="wanted" selected={wanted} onSelectedChange={setWanted} manual={wantedManual} onManualChange={setWantedManual}/></TabsContent>
 <TabsContent value="preferred" forceMount className="preserved-tab"><FoodPicker mode="preferred" selected={preferred} onSelectedChange={setPreferred} manual={preferredManual} onManualChange={setPreferredManual}/></TabsContent>
 <TabsContent value="excluded" forceMount className="preserved-tab"><FoodPicker mode="excluded" selected={excluded} onSelectedChange={v=>{dirty.current=true;setExcluded(v);setNotice('')}} manual={excludedManual} onManualChange={v=>{dirty.current=true;setExcludedManual(v);setNotice('')}}/><div className="action-row"><button type="button" className="secondary-button" disabled={prefs.loading||prefs.saving} onClick={async()=>{if(await prefs.saveExcluded(excludedText.split('、').filter(Boolean).map(conditionName)))setNotice('いつも避けたい食材を保存しました。次回の初期条件に使います。')}}>いつも避けたい食材として保存</button><button type="button" className="text-button" disabled={prefs.loading} onClick={()=>{dirty.current=true;setExcluded(prefs.excluded);setExcludedManual('')}}>保存した条件に戻す</button></div>{notice&&<p className="success" role="status">{notice}</p>}</TabsContent></Tabs>
 <div className="recipe-conditions"><p><strong>必ず使う：</strong>{wantedText||'指定なし'}</p><p><strong>できれば：</strong>{preferredText||'指定なし'}</p><p><strong>避けたい：</strong>{excludedText||'指定なし'}</p></div>
 {conflicts.length>0&&<p className="error" role="alert">{conflicts.join('、')}が必須と除外の両方にあります。どちらかを解除してください。</p>}
 <div className="form-bottom"><span>「できれば」は順位に反映します。除外条件を外すことはありません。</span><button className="primary" disabled={conflicts.length>0}><ChefHat size={18}/>献立を提案する</button></div></form>
 <div className="note">分量は料理の一人分の案です。食材ごとの収録例と異なる量や、料理全体のFODMAP合計は未評価です。</div>
 <div aria-live="polite">{pending?<p className="empty-result">条件を変更しました。「献立を提案する」で更新してください。</p>:<><p>{recipes.length}案のうち条件に合う献立：{found.length}件</p>{found.map(r=><article className="recipe" key={r.title}><span className="eyebrow">1人分の献立案 · 約{r.minutes}分</span><h3>{r.title}</h3>{applied.preferred&&<p className="small">できれば使いたい食材：{r.preferredMatches.length}種類が一致</p>}<h4>材料</h4><ul>{r.ingredients.map(i=><li key={i.name}>{i.name} — {i.amount}</li>)}</ul><h4>作り方</h4><ol>{r.steps.map(s=><li key={s}>{s}</li>)}</ol><small>公開資料を参考にした献立案です。認証レシピではありません。</small><button type="button" className="secondary-button" onClick={()=>onRecord(r.title+'（'+r.ingredients.map(i=>i.name).join('、')+'）',r.ingredients.map(i=>i.name+' '+i.amount).join('、'))}>この献立を食事に記録</button></article>)}{!found.length&&<div className="empty-result"><h3>条件に合う献立案がありません。</h3><p>除外条件を維持しながら、必須の食材の一部を「できれば」に移すと候補が広がります。</p></div>}</>}</div>
 </section><aside><section className="guide-card"><Clock size={22}/><h2>材料を確かめてから。</h2><p>市販のだし・たれ・加工品は、追加材料も確認してください。</p><p>食材名と別名で照合します。アレルギーの混入防止や商品の成分確認には対応していません。</p><a href={source} target="_blank" rel="noreferrer">食品分類の出典</a></section><section className="sub-card"><a href="https://www.monashfodmap.com/blog/low-fodmap-shopping-list/" target="_blank" rel="noreferrer">Monash大学：食材選択の参考</a><p className="small">肉の中心温度・加熱も確認してください。</p><a className="small" href="https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/shokuhin/syokuchu/campylobacterqa.html" target="_blank" rel="noreferrer">厚生労働省：鶏肉の加熱</a></section></aside></div>
}

