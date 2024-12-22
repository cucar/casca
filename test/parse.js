import 'dotenv/config';
import { writeFileSync } from 'fs';
import { LlamaParseReader } from 'llamaindex';

const parser = new LlamaParseReader({ resultType: 'markdown', premiumMode: true });

const file = 'test4';
const documents = await parser.loadData(`./test/${file}.pdf`);
documents.forEach((doc, index) => writeFileSync(`./test/${file}_${index}.md`, doc.text));
