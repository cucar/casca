import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import Parser from '../Parser.js';

const fileName = 'test4';
const fileContent = readFileSync(`./test/files/${fileName}.pdf`);
const parser = new Parser();
const pages = await parser.parse(fileContent, `${fileName}.pdf`);
pages.forEach((page, index) => writeFileSync(`./test/parsed/${fileName}_${index}.md`, page));
