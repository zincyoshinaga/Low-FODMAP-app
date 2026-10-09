import type {Metadata} from 'next';import './globals.css';
export const metadata:Metadata={title:'おなかノート | 食材確認と食事・体調の記録',description:'公開資料に基づくFODMAP食品の確認、除外食材に合わせたレシピ提案、食事と体調の記録。',icons:{icon:'/favicon.svg',shortcut:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ja"><body>{children}</body></html>}