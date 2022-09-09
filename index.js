// fetch all aws directory api metadata (arch diagrams, products, blog posts, builders library articles, etc.)

import { program } from "commander";
import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import lunr from "lunr";
import metadata from './metadata.js'
import _ from "lodash"

(async () => {
  //const metadata = JSON.parse(fs.readFileSync('./metadata.json'))
  const directories = metadata.directories;

  const l = (o) => {
    console.log(JSON.stringify(o, null, 2));
  };

  const sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  const fetchJSON = async (url) => {
    l(`fetchJSON("${url}")`);
    const resp = await fetch(url);
    const data = await resp.json();
    return data;
  };

  const fetchDirectoryMetadata = async (directoryId) => {
    const metadataURL = `https://aws.amazon.com/api/dirs/items/search?item.directoryId=${encodeURIComponent(directoryId)}&item.locale=en_US`;
    const data = await fetchJSON(metadataURL);
    return data;
  };

  const fetchDirectoryContent = async (directoryId, metadata) => {
    const urlTemplate = `https://aws.amazon.com/api/dirs/items/search?item.directoryId=${encodeURIComponent(directoryId)}&size=${metadata.metadata.count}&sort_by=item.dateCreated&sort_order=desc&item.locale=en_US&page=`;
    const pageIndexes = Array.from(Array(metadata.metadata.pageCount).keys());
    const pages = [];
    for (const pageIndex of pageIndexes) {
      const url = urlTemplate + `${pageIndex}`;
      const data = await fetchJSON(url);
      if (data.items.length > 0) {
        pages.push(data);
      } else if (pageIndex < pageIndexes[pageIndexes.length - 1]) {
        // appears max page is 1000.  this is based on "directoryId=blog-posts,action=break,pageIndex=1000,pageIndexes.length=2077""
        l(
          `directoryId=${directoryId},action=break,pageIndex=${pageIndex},pageIndexes.length=${pageIndexes.length}`
        );
        break;
      }
    }
    return pages;
  };

  const fetchDirectory = async (directoryId) => {
    const metadata = await fetchDirectoryMetadata(directoryId);
    const pageCount = Math.ceil(
      metadata.metadata.totalHits / metadata.metadata.count
    );
    metadata.metadata.pageCount = pageCount;
    const data = await fetchDirectoryContent(directoryId, metadata);
    return data;
  };

  const saveFile = async () => {
    // create a new handle
    const newHandle = await window.showSaveFilePicker();

    // create a FileSystemWritableFileStream to write to
    const writableStream = await newHandle.createWritable();

    const obj = { hello: "world" };
    const blob = new Blob([JSON.stringify(obj, null, 2)], {
      type: "application/json",
    });

    // write our file
    await writableStream.write(blob);

    // close the file and write the contents to disk.
    await writableStream.close();
  };

  const getItemsFromPages = async (pages) => {
    const items = pages.map((p) => p.items.map((i) => i.item)).flat();
    return items;
  };

  const enrichItems = async (items, directoryId) => {
    const directoryTitleFieldName =
      await getDirectoryTitleFieldNameByDirectoryId(directoryId);
    return items.map((i) => {
      i.directoryId = directoryId;
      i.title = i.additionalFields[directoryTitleFieldName];
      return i;
    });
  };

  const getEnrichedItemsByDirectoryId = async (directoryId) => {
    const pages = JSON.parse(
      fs.readFileSync(`data/${directoryId}.json`, { encoding: "utf-8" })
    );
    const items = await getItemsFromPages(pages);
    const enrichedItems = await enrichItems(items, directoryId);
    return enrichedItems;
  };

  const getItem = async (directoryId, id) => {
    const items = await getEnrichedItemsByDirectoryId(directoryId);
    return items.find((i) => i.id === id);
  };

  const getDirectoryIdFromPath = (filePath) => path.basename(filePath, ".json");

  const createIndex = async () => {
    const relativeDirPath = "data";
    const fileNames = fs.readdirSync(relativeDirPath);
    for (const fileName of fileNames) {
      if (fileName.includes('.display.')) {
        continue
      }
      const directoryId = getDirectoryIdFromPath(fileName);
      const items = await getEnrichedItemsByDirectoryId(directoryId);
      //l(items)

      const idx = lunr(function () {
        this.ref("id");
        this.field("directoryId");
        this.field("name");
        this.field("title");
        this.field("description");
        this.field("dateCreated");
        this.field("dateUpdated");

        items.forEach(function (item) {
          // item.directoryId = directoryId;
          // item.title = item.additionalFields[titleFieldName]
          this.add(item);
        }, this);
      });
      fs.writeFileSync(
        `index/${directoryId}.json`,
        JSON.stringify(idx, null, 2)
      );
    }
  };

  const download = async (options) => {
    try {
      for (const directory of directories /* .slice(0,1) */) {
        if (options && options.directoryId && options.directoryId !== directory.directoryId) {
          continue;
        }
        const data = await fetchDirectory(directory.directoryId);
        const totalItems = data.reduce((previous, current) => {
          return previous + current.items.length;
        }, 0);
        l(
          `directory.directoryId=${directory.directoryId},totalPages=${data.length},totalItems=${totalItems},itemsPerPage=${data[0].metadata.count}`
        );
        //await sleep(1000)
        fs.writeFileSync(
          `data/${directory.directoryId}.json`,
          JSON.stringify(data, null, 2)
        );
      }
    } catch (e) {
      console.log(e);
    }
  };

  const index = async () => {
    return await createIndex();
  };

  const getDirectoryTitleFieldNameByDirectoryId = async (directoryId) => {
    const directory = directories.find((d) => d.directoryId === directoryId);
    const titleFieldName = directory.title;
    return titleFieldName;
  };

  const flattenData = async(options) => {
    for (const directory of metadata.directories) {
      const data = JSON.parse(fs.readFileSync(`data/${directory.directoryId}.json`, { encoding: "utf-8" }))
      const transformedData = data.flatMap(data => data.items.map(item => (item)))
      fs.writeFileSync(`data/${directory.directoryId}.flat.json`, JSON.stringify(transformedData, null, 2))
    }    
  }

  const createDataForFrontend = async () => {
    for (const directory of metadata.directories) {
      const data = JSON.parse(fs.readFileSync(`data/${directory.directoryId}.flat.json`, { encoding: "utf-8" }))
      const transformedData = data.map(item => {
        const displayItem = {}
        for (const field of directory.displayMetadata.fields) {
          _.set(displayItem, field.field, _.get(item, field.field))

          if (field.transform) {
            _.set(displayItem, field.field, field.transform(_.get(item, field.field), field, item, directory))
          }

          if (field.linkField) {
            _.set(displayItem, field.linkField, _.get(item, field.linkField))
          }
        }
        if (item.tags) {
          displayItem.item.tags = item.tags.map(t => t.name).join(',')
        }
        return displayItem;
      })
      fs.writeFileSync(`data/${directory.directoryId}.display.json`, JSON.stringify(transformedData))
    }
  }

  const search = async (directoryId, query) => {
    const titleFieldName = await getDirectoryTitleFieldNameByDirectoryId(
      directoryId
    );
    const items = await getEnrichedItemsByDirectoryId(directoryId);
    const idx = lunr.Index.load(
      JSON.parse(
        fs.readFileSync(`index/${directoryId}.json`, { encoding: "utf-8" })
      )
    );
    const searchResults = idx.search(query);
    const results = searchResults
      .map((e) => items.find((i) => i.id === e.ref))
      .map((e) => ({
        title: e.title,
        dateUpdated: e.dateUpdated,
        dateCreated: e.dateCreated,
      }));
    const sortFieldname = "dateCreated"; // "dateUpdated"
    const sortedResultsDesc = results
      .sort((a, b) => {
        if (a[sortFieldname] < b[sortFieldname]) {
          return -1;
        }
        if (a[sortFieldname] > b[sortFieldname]) {
          return 1;
        }

        // names must be equal
        return 0;
      })
      .reverse();
    l(sortedResultsDesc);
  };

  const main = async () => {
    program
      .version("0.1.0")
      .command("download")
      .option("-d, --directoryId <directoryId>", "directoryId")
      .action(async (options) => {
        await download(options);
      });
    program.command("flatten-data").action(async(options) => {
      await flattenData(options)
    })
    program.command("index").action(async () => {
      await index();
    });
    program.command("create-data-for-frontend").action(async () => {
      await createDataForFrontend();
    });
    program
      .command("search")
      .option("-d, --directoryId <directoryId>", "directoryId")
      .option("-q, --query <query>", "query", 80)
      .action(async (options) => {
        const resp = await search(options.directoryId, options.query);
        l(resp);
      });

    await program.parseAsync(process.argv);
    // .argument('<username>', 'user to login')
    // .argument('[password]', 'password for user, if required', 'no password given')
    // .action((username, password) => {
    // console.log('username:', username);
    // console.log('password:', password);
  };

  await main();
})();

/*
var params = {
  Bucket: 'STRING_VALUE', 
  ContinuationToken: 'STRING_VALUE',
  Delimiter: 'STRING_VALUE',
  EncodingType: url,
  ExpectedBucketOwner: 'STRING_VALUE',
  FetchOwner: true || false,
  MaxKeys: 'NUMBER_VALUE',
  Prefix: 'STRING_VALUE',
  RequestPayer: requester,
  StartAfter: 'STRING_VALUE'
};
s3.listObjectsV2(params, function(err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else     console.log(data);           // successful response
});
*/

/*
    const oldMain = async () => {
        const baseURL = `https://aws.amazon.com/api/dirs/items/search?item.directoryId=whitepapers&sort_by=item.additionalFields.sortDate&sort_order=desc&size=9&item.locale=en_US&tags.id=GLOBAL%23content-type%23reference-arch-diagram&page=`
        let page = 0;
        
    
        let more = true;
        let items = [];
    
        while (more) {
            const resp = await fetch(baseURL + `${page}`)
            const data = await resp.json();
            console.log(data);
            more = data.metadata.count > 0;
            if (more) {
                items.push(...data.items);
                page++;
            }
        }
        console.log(`pages=${page},items.length=${items.length}`);
        const output = JSON.stringify(items, null, 2);
        console.log(output);    
    }

*/

/*

# TODO


---

AWS Architecture Center
https://aws.amazon.com/api/dirs/items/search?item.directoryId=alias%23architecture-center&sort_by=item.additionalFields.sortDate&sort_order=desc&size=9&item.locale=en_US

querying various content types in the directory by tags.id querystring value

"contentType": "AWS Solution", tags.id=GLOBAL#content-type#solution
"contentType": "Pattern", tags.id=GLOBAL%23content-type%23pattern
"contentType": "Reference Architecture Diagram", tags.id=GLOBAL%23content-type%23reference-arch-diagram
"contentType": "Guide", tags.id=GLOBAL%23content-type%23tech-guide
"contentType": multi-valued, tags.id=GLOBAL%23content-type%23video
"contentType": "Whitepaper", tags.id=GLOBAL%23content-type%23whitepaper


*/
