import { readFileSync } from 'fs';
import Extractor from '../Extractor.js';

const file = 'test1';
const pageNo = 3;
const pageContent = readFileSync(`./test/parsed/${file}_${pageNo - 1}.md`, 'utf8');

const extractor = new Extractor();
const result = await extractor.extractPage(pageContent, true);
console.log(result);