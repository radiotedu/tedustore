import fs from 'node:fs/promises';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),out=path.join(root,'dist');
if(path.dirname(out)!==root||path.basename(out)!=='dist')throw new Error('Invalid build destination');
await fs.mkdir(out,{recursive:true});await fs.cp(path.join(root,'public'),out,{recursive:true,filter:source=>path.basename(source)!=='tedu-reference.png'});
// The supporting raster logo reference is not a website dependency and stays in source assets.
const report={output:out,site:'TEDUstore',mode:'static browser-only simulation'};console.log(JSON.stringify(report));
