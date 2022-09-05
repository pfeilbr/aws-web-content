import logo from './logo.svg';
import './App.css';
import lunr from 'lunr';

import React, { useState, useRef, useEffect, useMemo, useCallback} from 'react';
import { render } from 'react-dom';
import { AgGridReact } from 'ag-grid-react'; // the AG Grid React Component

import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS

const store = {}

const baseURL = `https://raw.githubusercontent.com/pfeilbr/aws-web-content/main`
const baseIndexURL = `${baseURL}/index`
const baseDataURL = `${baseURL}/data`
const indexURLForDirectoryId = (directoryId) => `${baseIndexURL}/${directoryId}.json`
const dataURLForDirectoryId = (directoryId) => `${baseDataURL}/${directoryId}.json`

const fetchJSON = async (url) => {
  const resp = await fetch(url);
  return await resp.json()
}

const fetchDirectoryData = async(directoryId) => {
  const directoryData = {
    index: lunr.Index.load(await fetchJSON(indexURLForDirectoryId(directoryId))),
    data: await fetchJSON(dataURLForDirectoryId(directoryId))
  }
  return directoryData;
}

// const loadIndex = async () => {
//     const resp = await fetch("https://raw.githubusercontent.com/pfeilbr/aws-web-content/main/index/amazon-redwood.json");
//     const idx = lunr.Index.load(await resp.json())
//     return idx
// }

// (async () => {
//   const idx = await loadIndex()
//   console.log(idx.search('distributed'))
// })()



function App() {

  const gridRef = useRef(); // Optional - for accessing Grid's API
  const [rowData, setRowData] = useState(); // Set rowData to Array of Objects, one Object per Row

  // Each Column Definition results in one Column.
  const [columnDefs, setColumnDefs] = useState([
    {field: 'item.additionalFields.headline', headerName: 'Title', cellRenderer: (props) => (
      <a href={props.data.item.additionalFields.headlineUrl} target="_blank">{props.value}</a>
    )},
    {field: 'item.additionalFields.publishedDate', headerName: 'Date'},
    {field: 'item.additionalFields.contentAuthor', headerName: 'Author'},
    {field: 'item.id'},
    {field: 'item.name'},
    {field: 'item.author'}
  ]);

   // DefaultColDef sets props common to all Columns
  const defaultColDef = useMemo( ()=> ({
    sortable: true,
    resizable: true,
    filter: true
  }));

  // Example of consuming Grid Event
  const cellClickedListener = useCallback( event => {
    console.log('cellClicked', event);
  }, []);

  // Example load data from sever
  useEffect(() => {

    const load = async () => {
      const directoryId = `amazon-redwood`
      const directoryData = await fetchDirectoryData(directoryId)
      console.log(directoryData)
      return directoryData
    }

    load()
      .then(data => {
        setRowData(data.data.flatMap(data => data.items))
      })
      .catch(console.error)

    // fetch('https://www.ag-grid.com/example-assets/row-data.json')
    // .then(result => result.json())
    // .then(rowData => setRowData(rowData))
  }, []);

  const autoSizeAll = useCallback((skipHeader) => {
    const allColumnIds = [];
    gridRef.current.columnApi.getColumns().forEach((column) => {
      allColumnIds.push(column.getId());
    });
    gridRef.current.columnApi.autoSizeColumns(allColumnIds, skipHeader);
  }, []);

  // Example using Grid's API
  const buttonListener = useCallback( e => {
    gridRef.current.api.deselectAll();
  }, []);

  return (
    <div>

      {/* Example using Grid's API */}
      <button onClick={autoSizeAll}>Push Me</button>

      {/* On div wrapping Grid a) specify theme CSS Class Class and b) sets Grid size */}
      <div className="ag-theme-alpine" style={{width: window.innerWidth, height: 800}}>

        <AgGridReact
            ref={gridRef} // Ref for accessing Grid's API

            rowData={rowData} // Row Data for Rows

            columnDefs={columnDefs} // Column Defs for Columns
            defaultColDef={defaultColDef} // Default Column Properties

            animateRows={true} // Optional - set to 'true' to have rows animate when sorted
            rowSelection='multiple' // Options - allows click selection of rows

            onCellClicked={autoSizeAll} // Optional - registering for Grid Event
            
            />
      </div>
    </div>
    );
}

export default App;
