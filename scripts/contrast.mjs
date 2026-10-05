// Solid-background text check. Photography and SVG artwork need visual review.
export async function textContrast(page){
 return page.evaluate(()=>{
  const rgba=value=>{const m=value.match(/[\d.]+/g);return m?[+m[0],+m[1],+m[2],m[3]===undefined?1:+m[3]]:null;};
  const luminance=color=>color.slice(0,3).reduce((n,c,i)=>{c/=255;return n+[.2126,.7152,.0722][i]*(c<=.04045?c/12.92:((c+.055)/1.055)**2.4);},0);
  const issues=[],walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let count=0,node;
  while((node=walker.nextNode())){
   if(!node.textContent.trim())continue;const el=node.parentElement;
   if(!el||el.closest('script,style,[hidden],dialog:not([open])')||el.closest(':disabled')||!el.getClientRects().length)continue;
   const style=getComputedStyle(el);if(style.visibility!=='visible'||+style.opacity===0)continue;
   let fg=rgba(style.color);if(!fg)continue;
   let ancestor=el,layers=[],photo=false;while(ancestor){const css=getComputedStyle(ancestor);if(css.backgroundImage!=='none')photo=true;const c=rgba(css.backgroundColor);if(c&&c[3])layers.push(c);ancestor=ancestor.parentElement;}
   if(photo)continue;let bg=[255,255,255];for(const c of layers.reverse())bg=bg.map((v,i)=>c[i]*c[3]+v*(1-c[3]));
   if(fg[3]<1)fg=fg.slice(0,3).map((v,i)=>v*fg[3]+bg[i]*(1-fg[3]));
   const a=luminance(fg),b=luminance(bg),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05),size=parseFloat(style.fontSize),bold=parseInt(style.fontWeight)>=700,min=size>=24||size>=18.66&&bold?3:4.5;count++;
   if(ratio+.01<min)issues.push({text:node.textContent.trim().slice(0,70),selector:el.className||el.tagName,ratio:+ratio.toFixed(2),minimum:min,color:style.color,background:bg.map(Math.round)});
  }
  return {checked:count,issues};
 });
}
