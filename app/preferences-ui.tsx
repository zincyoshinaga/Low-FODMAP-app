'use client';
import {createContext,useContext,useEffect,useRef,useState,type ReactNode} from 'react';
import {canonicalFoodName} from '@/lib/food-picker';
type Prefs={excluded:string[];favorites:string[];recent:string[]};
type Context=Prefs&{loading:boolean;auth:boolean;saving:boolean;error:string;saveExcluded:(names:string[])=>Promise<boolean>;toggleFavorite:(name:string)=>void;remember:(names:string[])=>void};
const initial:Prefs={excluded:['玉ねぎ','にんにく'],favorites:[],recent:[]};
const PrefContext=createContext<Context|null>(null);
export function PreferencesProvider({children}:{children:ReactNode}){
 const [prefs,setPrefs]=useState<Prefs>(initial);const state=useRef(prefs);const [loading,setLoading]=useState(true);const [auth,setAuth]=useState(false);const [saving,setSaving]=useState(false);const [error,setError]=useState('');const queue=useRef(Promise.resolve());const mounted=useRef(true);
 useEffect(()=>{mounted.current=true;const abort=new AbortController();fetch('/api/preferences',{cache:'no-store',signal:abort.signal}).then(async r=>{const v=await r.json() as Prefs & {error?:string};if(!r.ok){if(r.status===401){setAuth(true);return}throw new Error(v.error)}state.current=v;setPrefs(v)}).catch(e=>{if(!abort.signal.aborted)setError(e.message??'設定を読み込めませんでした。')}).finally(()=>{if(!abort.signal.aborted)setLoading(false)});return()=>{mounted.current=false;abort.abort()}},[]);
 function update(patch:Partial<Prefs>){state.current={...state.current,...patch};setPrefs(state.current)}
 async function persist(patch:Partial<Prefs>){if(auth){setError('設定を次回も使うにはサインインしてください。');return false}setError('');setSaving(true);let ok=false;const task=queue.current.then(async()=>{try{const r=await fetch('/api/preferences',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(patch)});const v=await r.json() as Prefs & {error?:string};if(!r.ok)throw new Error(v.error);ok=true}catch(e){if(mounted.current)setError(e instanceof Error?e.message:'設定を保存できませんでした。')}});queue.current=task;await task;if(mounted.current)setSaving(false);return ok}
 const value:Context={...prefs,loading,auth,saving,error,async saveExcluded(names){const excluded=[...new Set(names.map(canonicalFoodName))];if(await persist({excluded})){update({excluded});return true}return false},toggleFavorite(name){const canonical=canonicalFoodName(name);const favorites=state.current.favorites.includes(canonical)?state.current.favorites.filter(n=>n!==canonical):[...state.current.favorites,canonical];if(favorites.length>200){setError('お気に入りは200件までです。');return}update({favorites});void persist({favorites})},remember(names){const recent=[...new Set([...names.map(canonicalFoodName),...state.current.recent])].slice(0,12);if(JSON.stringify(recent)===JSON.stringify(state.current.recent))return;update({recent});if(!auth&&!loading)void persist({recent})}};
 return <PrefContext.Provider value={value}>{children}</PrefContext.Provider>;
}
export function usePreferences(){const value=useContext(PrefContext);if(!value)throw new Error('PreferencesProvider missing');return value}

