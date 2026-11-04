import {readdirSync} from 'node:fs';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
let checked=0;
for(const directory of ['server','scripts']){
  for(const entry of readdirSync(directory,{withFileTypes:true})){
    if(!entry.isFile() || !/\.(?:mjs|js)$/.test(entry.name))continue;
    const file=join(directory,entry.name);
    const result=spawnSync(process.execPath,['--check',file],{stdio:'inherit',windowsHide:true});
    if(result.status!==0)process.exit(result.status || 1);
    checked++;
  }
}
console.log(`Syntax checked ${checked} JavaScript modules. JSX is checked by the Vite build.`);
