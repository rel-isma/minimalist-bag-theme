// Shopify/CJ trim boundary whitespace; this never renames or writes an option.
export function sameOptions(actual,prepared){
 if(!Array.isArray(actual)||!Array.isArray(prepared)||actual.length!==prepared.length)return false;
 const pairs=values=>values.map(o=>[String(o.name).trim(),String(o.value).trim()]).sort((a,b)=>a[0].localeCompare(b[0]));
 const a=pairs(actual),b=pairs(prepared);
 return new Set(a.map(o=>o[0])).size===a.length&&new Set(b.map(o=>o[0])).size===b.length&&JSON.stringify(a)===JSON.stringify(b);
}
