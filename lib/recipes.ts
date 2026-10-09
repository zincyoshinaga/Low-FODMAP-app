import {normalize,findFood} from './foods';
export type Ingredient={name:string;amount:string;tags?:string[]};
export type Recipe={title:string;minutes:number;ingredients:Ingredient[];steps:string[]};
const rice:Ingredient={name:'ごはん',amount:'150g',tags:['米','白米','炊飯','炭水化物']};
const oil:Ingredient={name:'オリーブオイル',amount:'小さじ1',tags:['油']};
const salt:Ingredient={name:'塩',amount:'少々'};
export const recipes:Recipe[]=[
{title:'鶏肉とにんじんの蒸し焼きごはん',minutes:20,ingredients:[{name:'鶏肉',amount:'120g',tags:['肉','鶏むね肉']},{name:'にんじん',amount:'50g'},rice,oil,salt],steps:['鶏肉は小さめに切り、にんじんは薄く切る。','油をひいたフライパンに鶏肉とにんじんを入れる。水大さじ2を加えてふたをし、火が通るまで蒸し焼きにする。鶏肉の中心温度75℃で1分以上を目安に確認。','塩で味を整えて、ごはんに添える。市販のたれは加えず、材料を確認する。']},
{title:'鮭とじゃがいものフライパン蒸し',minutes:25,ingredients:[{name:'鮭',amount:'1切れ（100g程度）',tags:['魚','サーモン']},{name:'じゃがいも',amount:'100g'},oil,salt],steps:['じゃがいもを薄切りにし、油をひいたフライパンに並べる。','鮭と水大さじ3を加え、ふたをして弱めの中火で蒸す。じゃがいもが柔らかく、魚の中心まで火が通ることを確認。','塩で味を整える。にんにく・玉ねぎ入り調味料は加えない。']},
{title:'卵とにんじんのごはん',minutes:15,ingredients:[{name:'卵',amount:'1個',tags:['たまご']},{name:'にんじん',amount:'40g'},rice,oil,salt],steps:['にんじんを細かく切り、油をひいたフライパンで柔らかく炒める。','溶いた卵を加え、卵が固まるまで火を通す。','ごはんを加えてほぐしながら炒め、塩で味を整える。']},
{title:'木綿豆腐とじゃがいもの焼き皿',minutes:25,ingredients:[{name:'木綿豆腐',amount:'100g',tags:['豆腐','大豆','豆']},{name:'じゃがいも',amount:'100g'},oil,salt],steps:['木綿豆腐は水を切って厚めに切る。じゃがいもは薄切りにし、柔らかくなるまで下ゆでする。','油をひいたフライパンで豆腐とじゃがいもを両面焼く。','中心まで温まり、焼き色がついたら塩で味を整える。絹ごし豆腐への置換は避け、別途確認する。']}
];
const veg=(name:string,amount='75g'):Ingredient=>({name,amount});
const protein=(name:string):Ingredient=>({name,amount:name==='卵'?'1個':'100g',tags:name==='木綿豆腐'?['豆腐','大豆','豆']:['鶏肉','豚肉','牛肉'].includes(name)?['肉']:['鮭','鱈','えび','いか','あさり'].includes(name)?['魚','魚介']:[]});
function pan(title:string,main:string,vegetable:string,withRice=true):Recipe{
 return {title,minutes:20,ingredients:[protein(main),veg(vegetable),...(withRice?[rice]:[]),oil,salt],steps:[vegetable+'を食べやすく切る。'+(main==='卵'?'卵を溶く。':main==='あさり'?'砂抜き済みのあさりを洗う。':main==='えび'?'えびの殻と背わたを取り除く。':main+'を調理しやすい大きさにする。'),'油をひいたフライパンで'+(main==='卵'?'野菜':'材料')+'を炒め、水大さじ2を加えてふたをする。焦げそうな場合は水を足す。',main==='卵'?'溶き卵を加え、卵が固まるまで加熱する。':main==='木綿豆腐'?'豆腐も中心までしっかり温める。':'中心まで十分に加熱する。肉は中心温度75℃で1分以上を目安に確認し、魚介も生焼けを避ける。','塩で味を整える。'+(withRice?'ごはんを添える。':'')+'市販のたれを加える場合は材料を別途確認する。']};
}
recipes.push(
 pan('豚肉とにんじんの蒸し焼きごはん','豚肉','にんじん'),
 pan('豚肉とほうれん草の炒め皿','豚肉','ほうれん草',false),
 pan('豚肉とピーマンのごはん','豚肉','ピーマン'),
 pan('牛肉とチンゲン菜のごはん','牛肉','チンゲン菜'),
 pan('牛肉とじゃがいもの蒸し焼き','牛肉','じゃがいも',false),
 pan('鶏肉となすのごはん','鶏肉','なす'),
 pan('鶏肉とピーマンの炒め皿','鶏肉','ピーマン',false),
 pan('鶏肉といんげんのごはん','鶏肉','いんげん'),
 pan('鱈とじゃがいもの蒸し焼き','鱈','じゃがいも',false),
 pan('鱈とほうれん草のごはん','鱈','ほうれん草'),
 pan('えびとチンゲン菜のごはん','えび','チンゲン菜'),
 pan('えびとにんじんの炒め皿','えび','にんじん',false),
 pan('いかとピーマンのごはん','いか','ピーマン'),
 pan('あさりとほうれん草の蒸し皿','あさり','ほうれん草',false),
 pan('木綿豆腐となすの焼き皿','木綿豆腐','なす',false),
 pan('木綿豆腐とにんじんのごはん','木綿豆腐','にんじん'),
 pan('卵とほうれん草のごはん','卵','ほうれん草'),
 pan('卵とじゃがいもの炒め皿','卵','じゃがいも',false),
 {title:'きゅうりとレタスのサラダ',minutes:10,ingredients:[veg('きゅうり','50g'),veg('レタス','50g'),oil,salt],steps:['野菜を流水でよく洗い、水気を切る。','きゅうりを薄切りにし、レタスをちぎる。','油と塩を少量ずつ加えて和える。']},
 {title:'にんじんと卵のスープ',minutes:15,ingredients:[protein('卵'),veg('にんじん'),salt],steps:['にんじんを薄切りにし、水250mlと一緒に鍋に入れる。','にんじんが柔らかくなるまで煮る。','溶き卵を加え、卵が固まるまで加熱する。塩で味を整える。市販のだしを使う場合は原材料を確認する。']}
);
function tokens(text:string){return [...new Set(text.split(/[,，、\n]/).map(s=>s.replace(/\s*\d+(?:\.\d+)?\s*(?:g|グラム|ml|個|枚|杯)\s*$/i,'')).map(normalize).filter(Boolean))]}
function matches(ingredient:Ingredient,token:string,include=true){
 const canonical=findFood(token)?.name??token;
 const tags=include?(ingredient.tags??[]).filter(t=>['魚','肉'].includes(t)):ingredient.tags??[];
 return [ingredient.name,...tags,...findFood(ingredient.name)?.aliases??[]].some(alias=>
  normalize(alias)===token||normalize(findFood(alias)?.name??alias)===normalize(canonical));
}
export function suggestRecipes(excluded:string,wanted='',preferred=''){
 const avoid=tokens(excluded);const use=tokens(wanted);const prefer=tokens(preferred);
 return recipes.filter(recipe=>use.every(token=>recipe.ingredients.some(i=>matches(i,token)))&&
  !avoid.some(token=>recipe.ingredients.some(i=>matches(i,token,false)))).map(recipe=>({...recipe,preferredMatches:prefer.filter(token=>recipe.ingredients.some(i=>matches(i,token)))})).sort((a,b)=>b.preferredMatches.length-a.preferredMatches.length||a.minutes-b.minutes);
}

