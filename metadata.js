import { render } from 'react-dom';
import React from 'react';

 export default {
    "directories": [
    {
      "directoryId": "amazon-redwood",
      "displayMetadata": [
        {"field": "item.additionalFields.headline", "headerName": "Title", cellRenderer: (props) => (
               <a href={props.data.item.additionalFields.headlineUrl} target="_blank">{props.value}</a>
             )},
        {"field": "item.additionalFields.publishedDate", "headerName": "Date"},
        {"field": "item.additionalFields.contentAuthor", "headerName": "Author"},
        {"field": "item.id"},
        {"field": "item.name"},
        {"field": "item.author"}
      ]      
    },
    {
      "directoryId": "event-content"
    },
    {
      "directoryId": "aws-products"
    },
    {
      "directoryId": "free-tier-products"
    },
    {
      "directoryId": "blog-posts",
      "title": "title"
    },
    {
      "directoryId": "whats-new",
      "title": "headline"
    },
    {
      "directoryId": "security-bulletins"
    },
    {
      "directoryId": "media-resources"
    },
    {
      "directoryId": "apg",
      "directoryName": "AWS Prescriptive Guidance",
      "title": "contentTitle",
      "description": "contentDescription",
      "url": "contentCtaUrl"
    },
    {
      "directoryId": "customer-references",
      "title": "AWS Customer Story"
    },
    {
      "directoryId": "alias#solutions-experience",
      "title": "AWS Quick Starts"
    }    
  ]}
