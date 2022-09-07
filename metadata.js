 export default {
    "directories": [
    {
      "directoryId": "amazon-redwood",
      "displayMetadata": {
        "title": "Amazon Builders' Library",
        "fields":[
          {"field": "item.additionalFields.headline", "headerName": "Title", "linkField": "item.additionalFields.headlineUrl"},
          {"field": "item.additionalFields.publishedDate", "headerName": "Date"},
          {"field": "item.additionalFields.contentAuthor", "headerName": "Author", "transform": (s) => (s.replace("Author: ", ""))},
          {"field": "item.tags", "headerName": "Tags"},
          // {"field": "item.id"},
          // {"field": "item.name"},
          // {"field": "item.author"}
      ]}
    },
    {
      "directoryId": "aws-products",
      "displayMetadata": {
      "title": "AWS Products",
      "fields": [
        {"field": "item.additionalFields.productName", "headerName": "Title", "linkField": "item.additionalFields.productUrl"},
        {"field": "item.additionalFields.launchDate", "headerName": "Date"},
        //{"field": "item.author", "headerName": "Author"},
        // {"field": "item.id"},
        // {"field": "item.name"},
        // {"field": "item.author"}          
      ]

      }
    },    
    {
      "directoryId": "event-content",
      "displayMetadata": {
        "title": "AWS Events Content",
        "fields": [
          {"field": "item.additionalFields.headline", "headerName": "Title", "linkField": "item.additionalFields.headlineUrl"},
          {"field": "item.additionalFields.sortDate", "headerName": "Date"},
          //{"field": "item.author", "headerName": "Author"},
          // {"field": "item.id"},
          // {"field": "item.name"},
          // {"field": "item.author"}          
        ]
      }
    },

    {
      "directoryId": "free-tier-products",
      "displayMetadata": {
      "title": "AWS Free Tier Products",
      "fields": [
        {"field": "item.additionalFields.serviceName", "headerName": "Title",  "linkField": "item.additionalFields.campaignUrl"},
        {"field": "item.dateCreated", "headerName": "Date", "transform": (s) => (s.split("T")[0])},
        // {"field": "item.author", "headerName": "Author"},
        // {"field": "item.id"},
        // {"field": "item.name"},
        // {"field": "item.author"}          
      ]
      }
    },
    {
      "directoryId": "blog-posts",
      "title": "title",
      "displayMetadata": {
        "title": "Blog Posts",
        "fields": [
          {"field": "item.additionalFields.title", "headerName": "Title", "linkField": "item.additionalFields.link"},
          {"field": "item.additionalFields.modifiedDate", "headerName": "Date", "transform": (s) => (s.split("T")[0])},
          {"field": "item.author", "headerName": "Author", "transform": (s) => (JSON.parse(s).join(", "))},
          // {"field": "item.id"},
          // {"field": "item.name"},
          // {"field": "item.author"}          
        ]
      }
    },
    {
      "directoryId": "whats-new",
      "title": "headline",
      "displayMetadata": {
        "title": "Whats New",
        "fields": [
          {"field": "item.additionalFields.headline", "headerName": "Title", "linkField": "item.additionalFields.headlineUrl"},
          {"field": "item.additionalFields.postDateTime", "headerName": "Date", "transform": (s) => (s.split("T")[0])},
          // {"field": "item.author", "headerName": "Author"},
          // {"field": "item.id"},
          // {"field": "item.name"},
          // {"field": "item.author"}          
        ]
        }     
    },
    {
      "directoryId": "security-bulletins",
      "displayMetadata": {
        "title": "Security Bulletins",
        "fields": [
          {"field": "item.additionalFields.bulletinSubject", "headerName": "Title", "linkField": "item.additionalFields.bulletinSubjectUrl"},
          {"field": "item.additionalFields.bulletinDate", "headerName": "Date"},
          //{"field": "item.author", "headerName": "Author"},
          // {"field": "item.id"},
          // {"field": "item.name"},
          // {"field": "item.author"}          
        ]
        }
    },
    {
      "directoryId": "media-resources",
      "displayMetadata": {
        "title": "Media Resources",
        "fields": [
          {"field": "item.additionalFields.contentTitle", "headerName": "Title", "linkField": "item.additionalFields.contentCtaURL"},
          {"field": "item.dateUpdated", "headerName": "Date", "transform": (s) => (s.split("T")[0])},
          // {"field": "item.author", "headerName": "Author"},
          // {"field": "item.id"},
          // {"field": "item.name"},
          // {"field": "item.author"}          
        ]

        }
    },
    // {
    //   "directoryId": "apg",
    //   "directoryName": "AWS Prescriptive Guidance",
    //   "title": "contentTitle",
    //   "description": "contentDescription",
    //   "url": "contentCtaUrl",
    //   "displayMetadata": {
    //     "title": "AWS Prescriptive Guidance"
    //     }
    // },
    // {
    //   "directoryId": "customer-references",
    //   "title": "AWS Customer Story",
    //   "displayMetadata": {
    //     "title": "AWS Customer Story"
    //     }
    // },
    // {
    //   "directoryId": "alias#solutions-experience",
    //   "title": "AWS Quick Starts",
    //   "displayMetadata": {
    //     "title": "AWS Quick Starts"
    //     }
    // },
    {
      "directoryId": "alias#architecture-center",
      "title": "AWS Architecture Center",
      "displayMetadata": {
        "title": "AWS Architecture Center",
        "fields": [
          {"field": "item.additionalFields.headline", "headerName": "Title", "linkField": "item.additionalFields.headlineUrl"},
          {"field": "item.additionalFields.contentType", "headerName": "Type"},
          {"field": "item.additionalFields.sortDate", "headerName": "Date"},
        ]
        }
    }    
  ]}
