'use client';
import {useState,useEffect} from 'react';
import Recipes from './recipes-ui';
import Diary from './diary-ui';
import Reports from './reports-ui';
import Sources from './sources-ui';
import FoodPicker from './food-picker-ui';
import PortionInfo from './portion-ui';
import {PreferencesProvider,usePreferences} from './preferences-ui';
import {materialText} from '@/lib/food-picker';
import {type MealTransfer} from '@/lib/diary';
import {Search,NotebookPen,ChefHat,BookOpen,Leaf,ShieldCheck,Info,ChartNoAxesCombined} from 'lucide-react';
import {Tabs,TabsList,TabsTrigger,TabsContent} from '@/components/ui/tabs';
import {checkFoods,labels} from '@/lib/foods';
import {registerTool} from '@/lib/webmcp';
export default function App(){return <PreferencesProvider><AppWorkspace/></PreferencesProvider>}
function AppWorkspace(){
 const [selected,setSelected]=useState<string[]>([]);const [query,setQuery]=useState('');const [checked,setChecked]=useState('');const results=checkFoods(checked);const [activeTab,setActiveTab]=useState('check');const [transfer,setTransfer]=useState<MealTransfer|null>(null);const [revision,setRevision]=useState(0);const prefs=usePreferences();
 function record(food:string,amount:string){setTransfer({token:crypto.randomUUID(),food,amount});setActiveTab('diary')}
 useEffect(()=>registerTool({name:'check_fodmap_foods',title:'食材を確認する',description:'入力した食材の分類を確認し、食材確認の画面を更新します。保存はしません。',inputSchema:{type:'object',properties:{text:{type:'string',minLength:1,maxLength:2000}},required:['text'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input){const v=input as {text?:unknown};if(typeof v?.text!=='string'||!v.text.trim()||v.text.length>2000)throw new Error('食材を入力してください');setSelected([]);setQuery(v.text);setChecked(v.text);setActiveTab('check');return {results:checkFoods(v.text).map(r=>({food:r.food?.name??r.input,status:labels[r.status],quantityAssessment:'種類・部位と一食量を確認してください'}))}}}),[]);
 return <div className="app-shell" data-active-tab={activeTab}><header className="topbar"><div className="brand"><span className="brand-mark"><Leaf size={23}/></span><span>おなかノート<small>FODMAP & DAILY CARE</small></span></div><span className="private"><ShieldCheck size={16}/>自分のための食事記録</span></header>
 <main><div className="intro"><span className="eyebrow">毎日の食事を、少しずつ自分に合わせる</span><h1>今日は、何を食べよう。</h1><p>食材を確かめて、食事とおなかの調子を残しましょう。</p></div>
 {prefs.error&&<p className="error no-print" role="alert">{prefs.error}{prefs.auth&&<> <a href="/signin-with-chatgpt?return_to=/" target="_top">サインインする</a></>}</p>}
 <Tabs value={activeTab} onValueChange={setActiveTab}><TabsList className="main-tabs"><TabsTrigger value="check"><Search/>食材を調べる</TabsTrigger><TabsTrigger value="recipes"><ChefHat/>レシピを考える</TabsTrigger><TabsTrigger value="diary"><NotebookPen/>食事・体調の記録</TabsTrigger><TabsTrigger value="reports"><ChartNoAxesCombined/>振り返り</TabsTrigger><TabsTrigger value="sources"><BookOpen/>情報の出典</TabsTrigger></TabsList>
 <TabsContent value="check" forceMount className="preserved-tab"><div className="workspace"><section className="panel"><div className="panel-heading"><span className="section-number">01</span><div><h2>食べる前に、ひとつ確認</h2><p>食材の分類と、一食量の収録例を分けて確かめます。</p></div></div>
 <form onSubmit={e=>{e.preventDefault();setChecked(materialText(selected,query))}}><FoodPicker selected={selected} onSelectedChange={foods=>{setSelected(foods);setChecked('')}} manual={query} onManualChange={text=>{setQuery(text);setChecked('')}}/><div className="form-bottom"><span>選んだ食材と手入力した材料をまとめて確認します。</span><button className="primary" disabled={!materialText(selected,query)}><Search size={18}/>選んだ食材を確認する</button></div></form>
 <div className="results" aria-live="polite">{results.length?<><div className="action-row"><button type="button" className="secondary-button" onClick={()=>record(results.map(r=>r.food?.name??r.input).join('、'),results.filter(r=>r.amount).map(r=>r.input).join('、').slice(0,300))}>確認した食材をまとめて食事に記録</button></div>{results.map((r,i)=><article className={'food-result '+r.status} key={r.input+'-'+i}><div className="food-result-heading"><div><p className="small">食品の分類（量の評価とは別）</p><span className="status-label">{labels[r.status]}</span><h3>{r.food?.name??r.input}</h3></div>{r.food&&<a href={r.food.sourceUrl} target="_blank" rel="noreferrer">分類の根拠</a>}</div><p>{r.food?.note??'分類情報は未収録です。料理名の場合は材料ごとに分け、公式の食品情報で確認してください。'}</p><small>{r.food?.group??'情報不足'} · 公開資料による分類の目安</small><PortionInfo result={r} onRecord={record}/></article>)}</>:<div className="empty-result"><Search size={28}/><h3>気になる食材から始めましょう</h3><p>分類の理由と出典、収録した一食量の例を表示します。</p></div>}</div>
 </section><aside><section className="guide-card"><Info size={22}/><h2>種類・量・加工法を一緒に。</h2><p>同じ食品でも一食量や加工法で評価が変わります。種類・部位を確認して選びましょう。</p><div className="legend"><span className="status-label low">低FODMAPの候補</span><span className="status-label caution">注意・条件を確認</span><span className="status-label high">高FODMAPで控える目安</span></div><p className="small">公開資料で確認できた量の例を収録しています。別の量への換算や、複数食材のFODMAP合計は未評価です。症状が出ない保証ではありません。</p><a href="https://www.monashfodmap.com/blog/traffic-light-system/" target="_blank" rel="noreferrer">Monash大学の量と判定の説明</a></section><section className="sub-card"><h3>毎日の入力を少し軽く。</h3><p>星でお気に入りに登録できます。最近使った食材も次の選択に使えます。</p><p>入力中の内容は、タブを移動しても保持されます。未保存の下書きはページを閉じると失われます。</p></section></aside></div></TabsContent>
 <TabsContent value="recipes" forceMount className="preserved-tab"><Recipes onRecord={record} onActivate={()=>setActiveTab('recipes')}/></TabsContent>
 <TabsContent value="diary" forceMount className="preserved-tab"><Diary transfer={transfer} onChanged={()=>setRevision(v=>v+1)}/></TabsContent>
 <TabsContent value="reports" forceMount className="preserved-tab"><Reports revision={revision} active={activeTab==='reports'}/></TabsContent>
 <TabsContent value="sources" forceMount className="preserved-tab"><Sources/></TabsContent>
 </Tabs><footer>食事の選択を支える参考情報です。診断・治療の代わりにはなりません。低FODMAP食は医師・管理栄養士と相談して進めましょう。</footer></main></div>
}
