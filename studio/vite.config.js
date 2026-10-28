import {defineConfig} from 'vite';import {fileURLToPath} from 'node:url';
export default defineConfig({root:fileURLToPath(new URL('./',import.meta.url)),server:{port:5173,proxy:{'/api':'http://127.0.0.1:4310','/media':'http://127.0.0.1:4310'}},build:{outDir:'dist',emptyOutDir:true}});
