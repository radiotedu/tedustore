import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

// This command deliberately accepts no target override and never replaces a site.
// It writes only the new TEDUstore subtree, a local backup and a receipt.
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const webroot=path.resolve('C:/inetpub/wwwroot');
const target=path.join(webroot,'tedustore');
if(!process.argv.includes('--new-only'))throw new Error('Run with --new-only after npm run build and review.');
if(path.dirname(target)!==webroot||path.basename(target)!=='tedustore')throw new Error('Unsafe destination');
try{await fs.lstat(target);throw new Error('TEDUstore already exists; this script never overwrites a deployment.');}catch(e){if(e.code!=='ENOENT')throw e;}
const files=[];
async function collect(dir){for(const item of await fs.readdir(dir,{withFileTypes:true})){const file=path.join(dir,item.name);if(item.isSymbolicLink())throw new Error('Symlinks are not deployable');if(item.isDirectory())await collect(file);else files.push(file);}}
await collect(path.join(root,'dist'));
for(const name of ['index.html','app.js','styles.css','catalog.js','i18n.js','web.config'])if(!files.includes(path.join(root,'dist',name)))throw new Error('Build is incomplete: '+name);
const forbidden=files.filter(f=>/\.(?:php|env|sql|bak)$/i.test(f)||/node_modules|\.git[\\/]/.test(f));
if(forbidden.length)throw new Error('Unexpected files in static build');
const protectedFiles=['web.config','index.php','wp-config.php'].map(f=>path.join(webroot,f));
for(const theme of ['radiotedu','crete-child']){const dir=path.join(webroot,'wp-content','themes',theme);try{for(const name of await fs.readdir(dir))if(/\.(?:php|css|js)$/.test(name))protectedFiles.push(path.join(dir,name));}catch(e){if(e.code!=='ENOENT')throw e;}}
async function hashes(){const result={};for(const file of protectedFiles){try{const b=await fs.readFile(file);result[path.relative(webroot,file)]=crypto.createHash('sha256').update(b).digest('hex');}catch(e){if(['EPERM','EACCES'].includes(e.code))result[path.relative(webroot,file)]='not-readable:'+e.code;else if(e.code!=='ENOENT')throw e;}}return result;}
async function health(){const result=[];for(const url of ['https://radiotedu.com/','https://radiotedu.com/erp/','https://radiotedu.com/bilet/']){try{const r=await fetch(url,{signal:AbortSignal.timeout(20000),redirect:'follow'});await r.arrayBuffer();result.push({url,status:r.status,finalUrl:r.url});}catch(e){result.push({url,error:e.message});}}return result;}
const stamp=new Date().toISOString().replace(/[:.]/g,'-');
const backup=path.join(root,'backups','deployment-'+stamp);await fs.mkdir(backup,{recursive:true});
const before=await hashes(),healthBefore=await health();
await fs.copyFile(path.join(webroot,'web.config'),path.join(backup,'parent-web.config'));
await fs.writeFile(path.join(backup,'protected-hashes.json'),JSON.stringify(before,null,2));
await fs.mkdir(target);await fs.cp(path.join(root,'dist'),target,{recursive:true});
const after=await hashes(),unchanged=JSON.stringify(before)===JSON.stringify(after);
const unreadableProtected=Object.keys(before).filter(f=>before[f].startsWith('not-readable:'));
const receipt={createdAt:new Date().toISOString(),target,files:files.length,backup,protectedFiles:Object.keys(before).length-unreadableProtected.length,unreadableProtected,unchanged,healthBefore,healthAfter:await health(),before,after};
await fs.writeFile(path.join(root,'docs','deployment-receipt.json'),JSON.stringify(receipt,null,2));
if(!unchanged)throw new Error('A protected file changed during deployment; inspect the receipt.');
console.log(JSON.stringify({target,files:files.length,protectedFiles:receipt.protectedFiles,unchanged,healthBefore,healthAfter:receipt.healthAfter}));
