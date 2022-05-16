# aws-web-content

* fetch all aws directory api metadata (arch diagrams, products, blog posts, builders library articles, etc.)
* based on public data fetched via `https://aws.amazon.com/api/dirs/items/search?item.directoryId=${directoryId}&item.locale=en_US`
* [`index.js`](index.js) - entrypoint
* [`data/`](data/) - directory items

## Data Shapes

**general response shape**

```json
{
  "items": [],
  "metadata": {
    "count": 0,
    "totalHits": 299
  },
  "fieldTypes": {
    "updateDate": "Date",
    "imageSrcUrl": "URL",
    "featureFlag": "Text",
    "description": "LongText",
    "sortDate": "Date",
    "docTitle": "Text",
    "primaryURL": "URL",
    "datePublished": "Date",
    "publishedText": "Text",
    "footerInfoSubtext": "Text",
    "subHeadline": "Text",
    "enableShare": "Boolean",
    "category": "Text",
    "contentType": "Text"
  }
}
```


**example item (items[0].item)**

```json
    {
      "item": {
        "id": "whitepapers#image-moderation-chatbot",
        "locale": "en_US",
        "directoryId": "whitepapers",
        "name": "image-moderation-chatbot",
        "author": "julicoll",
        "createdBy": "julicoll",
        "lastUpdatedBy": "julicoll",
        "numImpressions": 0,
        "score": 0,
        "dateCreated": "2019-06-25T17:21:57+0000",
        "dateUpdated": "2021-07-29T17:01:46+0000",
        "additionalFields": {
          "datePublished": "2018-12-05",
          "publishedText": "December 2018",
          "description": "Shows you how to build a serverless chatbot on AWS that monitors your chat channels and removes images containing suggestive or explicit content.<p><a href=\"https://github.com/awslabs/lambda-refarch-imagemoderationchatbot?did=wp_card&trk=wp_card\" target=\"_blank\" rel=\"noopener\">Code</a></p><p class=\"m-subheadline\">Media Services | Serverless</p>",
          "docTitle": "Image Moderation Chatbot",
          "sortDate": "2018-12-05",
          "enableShare": "1",
          "contentType": "Reference Architecture Diagram",
          "primaryURL": "https://github.com/awslabs/lambda-refarch-imagemoderationchatbot?did=wp_card&trk=wp_card"
        }
      },
      "tags": [
        {
          "id": "GLOBAL#content-type#reference-arch-diagram",
          "locale": "en_US",
          "tagNamespaceId": "GLOBAL#content-type",
          "name": "Reference Architecture Diagram",
          "description": "Reference Architecture Diagram",
          "createdBy": "jenbar",
          "lastUpdatedBy": "jenbar",
          "dateCreated": "2020-04-29T05:19:31+0000",
          "dateUpdated": "2022-02-03T03:31:09+0000"
        },
        {
          "id": "GLOBAL#methodology#serverless",
          "locale": "en_US",
          "tagNamespaceId": "GLOBAL#methodology",
          "name": "Serverless",
          "description": "Serverless",
          "createdBy": "jenbar",
          "lastUpdatedBy": "jenbar",
          "dateCreated": "2020-06-05T07:06:34+0000",
          "dateUpdated": "2022-02-03T03:32:11+0000"
        },
        {
          "id": "GLOBAL#tech-category#media-services",
          "locale": "en_US",
          "tagNamespaceId": "GLOBAL#tech-category",
          "name": "Media Services",
          "description": "Media Services",
          "createdBy": "jarfaa",
          "lastUpdatedBy": "jenbar",
          "dateCreated": "2020-07-17T03:06:10+0000",
          "dateUpdated": "2022-02-03T03:35:28+0000"
        }
      ]
    }
```

## TODO

* step fn processing logic - need to figure out how to not download everything each run.  way to download only new or changed items since last run
    * define work by getting metadata for number results via https://...?item.directoryId=${directoryId}&item.locale=en_US&page=0.  generate singe sqs message for each unique URL
    * use returned `metadata.count` for `size` query string parameter
    * &sort_by=item.[dateCreated|dateUpdated]&sort_order=desc
    * lambda subscription to SQS.  process sequencially.  set batch size to >1 initially to see if throttling.  can always set batch size to 1
* use <https://lunrjs.com/> for searching.  see <https://lunrjs.com/guides/getting_started.html> for pre-creating index
* all blogs (<https://aws.amazon.com/blogs/>)
    * template URL - "https://aws.amazon.com/api/dirs/items/search?item.directoryId=blog-posts&sort_by=item.additionalFields.createdDate&sort_order=desc&size=10&item.locale=en_US&page=1"
* all events content (<https://aws.amazon.com/events/events-content>) page=0...N
    * template URL "https://aws.amazon.com/api/dirs/items/search?item.directoryId=event-content&sort_by=item.dateCreated&sort_order=desc&size=12&item.locale=en_US&tags.id=GLOBAL%23language%23english&page=1"
* Builders Library - https://aws.amazon.com/api/dirs/items/search?item.directoryId=amazon-redwood&sort_by=item.additionalFields.customSort&sort_order=asc&size=24&item.locale=en_US

## Scratch

```sh
# download data from api
node index.js download

# index data into lunr indexes
node index.js index

# search against an index
node index.js search --directoryId "whats-new" --query "name:*lambda*"
```

## One-liner to retrieve a list of all AWS products

```sh
# source: <https://gist.github.com/garystafford/37442d8fd8dde388f50856c6a2900b0d>
# One-liner to retrieve a list of all AWS products from aws.amazon.com/products sorted by product category (requires jq). Worked as of 2022-01-03. Page format tends to change a lot...
curl --silent --compressed \
'https://aws.amazon.com/api/dirs/items/search?item.directoryId=aws-products&sort_by=item.additionalFields.productCategory&sort_order=asc&size=500&item.locale=en_US' \
| jq -r '.items[].item | .additionalFields.productCategory + " | " + .additionalFields.productName' \
| sort
```

## Resources

* <https://github.com/tycarac/aws-documents> - good refernce project that "Downloads AWS documents, currently whitepapers, from AWS documentation website."
* <https://github.com/nragusa/aws-newrelease-slack> - An AWS CDK application that sends AWS new service and feature release announcements to a Slack channel of your choice
