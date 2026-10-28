// Scan Git's intended contents without logging secret values.
import fs from 'node:fs';import {execFileSync} from 'node:child_process';
const staged=process.argv.includes('--staged');const paths=[...new Set(execFileSync('git',staged?['diff','--cached','--name-only','--diff-filter=ACMR','-z']:['ls-files','--cached','--others','--exclude-standard','-z']).toString().split('\0').filter(Boolean))];
const secrets=fs.existsSync('.env')?fs.readFileSync('.env','utf8').split('\n').flatMap(line=>{const m=line.match(/^([^=#]+)=(.*)$/);if(!m||!/KEY|SECRET|TOKEN|PASSWORD/.test(m[1]))return [];const v=m[2].trim().replace(/^["']|["']$/g,'');return v.length>=12?[Buffer.from(v)]:[];}):[];
const errors=[];let bytes=0;
for(const file of paths){if(/(^|\/)\.env(?:\.|$)/.test(file)&&file!=='.env.example'||/(^|\/)(?:\.state|node_modules|backups|\.aws|\.codex|\.agents)(\/|$)/.test(file)){errors.push('Private/runtime path: '+file);continue;}
 const body=staged?execFileSync('git',['show',':'+file],{maxBuffer:20*1024*1024}):fs.readFileSync(file);bytes+=body.length;
 if(secrets.some(value=>body.includes(value))||/-----BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY-----|shpat_[a-f0-9]{20,}|CJ\d+@api@[a-f0-9]{20,}/.test(body.toString()))errors.push('Possible credential: '+file);
 if(body.length>10*1024*1024)errors.push('Unexpected large file: '+file);
}
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}else console.log(`Repository check passed: ${paths.length} files, ${(bytes/1048576).toFixed(2)} MiB; no configured credentials or private runtime paths found.`);
