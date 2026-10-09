import {findFood,shoppingSource} from './foods';
export type PortionReference={id:string;food:string;variant:string;processing:string;grams:number;status:'low'|'high'|'caution';sourceUrl:string;published:string;checked:string};
// Only amounts explicitly stated in the current primary source are included.
// These are observed serving examples, not upper limits. No interpolation is made.
const samples:[string,string,string][]=[
 ['にんじん','carrot','一般的なにんじん'],['じゃがいも','potato','一般的なじゃがいも'],['きゅうり','cucumber','一般的なきゅうり'],['なす','eggplant','一般的ななす'],['レタス','lettuce','レタス'],['ほうれん草','spinach','ほうれん草'],['チンゲン菜','bok choy','チンゲン菜'],['ピーマン','green bell pepper','緑色のピーマン'],['いんげん','green bean','さやいんげん'],['さつまいも','sweet potato','さつまいも'],['キャベツ','white cabbage','白キャベツ'],['キャベツ','red cabbage','赤キャベツ'],['かぼちゃ','kabocha pumpkin','kabocha pumpkin（西洋かぼちゃ）'],['ブロッコリー','broccoli head','房の部分のみ'],['とうもろこし','corn kernels','粒のみ'],['トマト缶','canned tomato','缶詰のトマト'],['ひらたけ','oyster mushroom','ひらたけ（oyster mushroom）']
];
export const portionReferences:PortionReference[]=samples.map(([food,id,variant])=>({id,food,variant,processing:food==='トマト缶'?'缶詰（味付きソースとは区別）':'資料に調理状態の指定なし。追加材料は別途確認。',grams:75,status:'low',sourceUrl:shoppingSource,published:'2025-02-03',checked:'2026-10-07'}));
export function portionsFor(food:string){const canonical=findFood(food)?.name??food;return portionReferences.filter(r=>r.food===canonical)}
export function assessPortion(food:string,id:string,grams:number|null){const ref=portionsFor(food).find(r=>r.id===id);if(!ref||grams===null||!Number.isFinite(grams)||grams<=0||grams!==ref.grams)return {status:'unknown' as const,reference:ref};return {status:ref.status,reference:ref}}
