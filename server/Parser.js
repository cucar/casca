import 'dotenv/config';
import md5 from 'md5';
import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { LlamaParseReader } from 'llamaindex';

export default class Parser {

    /**
     * constructor - create the parser instance - premium mode is required for the parser to work
     */
    constructor() {
        this.parser = new LlamaParseReader({ resultType: 'markdown', premiumMode: true });
    }

    /**
     * parse a file and return the markdown content for its pages
     */
    async parse(fileContent, fileName) {

        // assign a unique id to the file based on its contents
        const fileId = md5(fileContent);

        // check if the file is already cached and return the cached file if it is
        if (this.isCached(fileId)) return this.getCached(fileId);

        // parse the file and retrieve markdown content
        const documents = await this.parser.loadDataAsContent(fileContent, fileName);

        // save the markdown content to the cache and return it from the cache
        this.saveCached(fileId, documents.map(doc => doc.text));
        return this.getCached(fileId);
    }

    /**
     * returns the file cache folder
     */
    getCacheFolder(fileId) {
        return `./cache/parser/${fileId}`;
    }

    /**
     * returns if the file is already cached
     */
    isCached(fileId) {
        return existsSync(this.getCacheFolder(fileId));
    }

    /**
     * saves a file to the cache
     */
    saveCached(fileId, pages) {

        // create file folder for cache
        const cacheFolder = this.getCacheFolder(fileId);
        if (!existsSync(cacheFolder)) mkdirSync(cacheFolder);

        // save the parsed file contents to the cache
        pages.forEach((page, index) => writeFileSync(`${cacheFolder}/page_${index}.md`, page));
    }

    /**
     * returns the cached file parsed into pages
     */
    getCached(fileId) {
        return readdirSync(this.getCacheFolder(fileId)).map(pageFile => readFileSync(`${this.getCacheFolder(fileId)}/${pageFile}`));
    }

}