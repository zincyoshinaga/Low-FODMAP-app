import {findFood,normalize} from './foods';
export const foodCategories=[
 {id:'vegetables',label:'野菜'},
 {id:'fruits',label:'果物'},
 {id:'meat-fish',label:'肉・魚'},
 {id:'eggs-soy',label:'卵・豆腐'},
 {id:'dairy',label:'乳製品・豆乳'},
 {id:'grains-seasoning',label:'主食・調味料'},
 {id:'other',label:'その他'},
] as const;
export type FoodCategory=typeof foodCategories[number]['id'];
export type PickerFood={id:string;name:string;category:FoodCategory};
export const commonFoods:PickerFood[]=[
 ...['にんじん','玉ねぎ','じゃがいも','きゅうり','なす','レタス','にんにく','ほうれん草','チンゲン菜','ピーマン','キャベツ','ブロッコリー','かぼちゃ','さつまいも','いんげん','とうもろこし','トマト','トマト缶','大根','かぶ','アスパラガス','グリーンピース','きのこ','ひらたけ'].map(name=>({id:name,name,category:'vegetables' as const})),
 ...['りんご','キウイ','みかん','オレンジ','パイナップル','ブルーベリー','いちご','バナナ','もも','梨','すいか','マンゴー','さくらんぼ','ぶどう'].map(name=>({id:name,name,category:'fruits' as const})),
 ...['鶏肉','豚肉','牛肉','魚','鮭','鱈','えび','いか','あさり'].map(name=>({id:name,name,category:'meat-fish' as const})),
 ...['卵','木綿豆腐','絹ごし豆腐','納豆'].map(name=>({id:name,name,category:'eggs-soy' as const})),
 ...['牛乳','乳糖除去牛乳','豆乳','大豆たんぱく由来の豆乳','アーモンドミルク','ハードチーズ','ヨーグルト','アイスクリーム','バター'].map(name=>({id:name,name,category:'dairy' as const})),
 ...['ごはん','食パン','オートミール','小麦パスタ','米粉パスタ','米麺','うどん','そば','砂糖','はちみつ','メープルシロップ','しょうゆ','みそ','マヨネーズ','酢','オリーブオイル','サラダ油','塩'].map(name=>({id:name,name,category:'grains-seasoning' as const})),
 ...['くるみ','ピーナッツ','カシューナッツ','マカダミアナッツ','ピスタチオ','ごま','ダークチョコレート'].map(name=>({id:name,name,category:'other' as const})),
];
export function canonicalFoodName(name:string){return findFood(name)?.name??name.normalize('NFKC').trim()}
export function foodKey(name:string){return normalize(canonicalFoodName(name))}
export function materialText(selected:string[],manual:string){
 const result=new Map<string,string>();
 for(const item of [...selected,...manual.split(/[,，、\n]/)]){const value=item.trim();if(!value)continue;const stripped=value.replace(/\s*\d+(?:\.\d+)?\s*(?:g|グラム|ml|個|枚|杯)\s*$/i,'').trim();const key=foodKey(stripped);if(!result.has(key)||stripped!==value)result.set(key,value)}
 return [...result.values()].join('、');
}
