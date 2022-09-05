import './App.css';
import lunr from 'lunr';

import React, { useState, useRef, useEffect, useMemo, useCallback} from 'react';
import { AgGridReact } from 'ag-grid-react'; // the AG Grid React Component
import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS
import metadata from './metadata.js'

const baseURL = `https://raw.githubusercontent.com/pfeilbr/aws-web-content/main`
const baseIndexURL = `${baseURL}/index`
const baseDataURL = `${baseURL}/data`
const directoryMetadataURL = `${baseURL}/metadata.json`
const indexURLForDirectoryId = (directoryId) => `${baseIndexURL}/${directoryId}.json`
const dataURLForDirectoryId = (directoryId) => `${baseDataURL}/${directoryId}.json`

const fetchJSON = async (url) => {
  const resp = await fetch(url);
  return await resp.json()
}

const fetchDirectoryMetadata = async () => {
  return fetchJSON(directoryMetadataURL)
}

const fetchDirectoryData = async(directoryId) => {
  const directoryData = {
    index: lunr.Index.load(await fetchJSON(indexURLForDirectoryId(directoryId))),
    data: await fetchJSON(dataURLForDirectoryId(directoryId))
  }
  return directoryData;
}

function App() {

  const gridRef = useRef();
  const [data, setData] = useState()
  const [rowData, setRowData] = useState(); // Set rowData to Array of Objects, one Object per Row
  const [columnDefs, setColumnDefs] = useState();

  const [directory, setDirectory] = useState()

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

  
  useEffect(() => {

    const load = async () => {
      const directoryIds = `amazon-redwood,aws-products`.split(',')
      //const metadata = await fetchDirectoryMetadata()
      const directories = await Promise.all(directoryIds.map(async directoryId => {
        const directoryData = await fetchDirectoryData(directoryId)
        return directoryData
      }))

      return {metadata, directories}
    }

    load()
      .then(data => {
        console.log(data)
        setData(data)
        //const directory = data.metadata.directories[0]
        //setDirectory(directory)
        // directory.displayMetadata.fields[0].cellRenderer =  (props) => (
        //        <a href={props.data.item.additionalFields.headlineUrl} target="_blank">{props.value}</a>
        //      )
        
        // setColumnDefs(directory.displayMetadata.fields)
        // setRowData(data.directories[0].data.flatMap(data => data.items))
      })
      .catch(console.error)
  }, []);

  const autoSizeAll = useCallback((skipHeader) => {
    const allColumnIds = [];
    gridRef.current.columnApi.getColumns().forEach((column) => {
      allColumnIds.push(column.getId());
    });
    gridRef.current.columnApi.autoSizeColumns(allColumnIds, skipHeader);
  }, []);

  const buttonListener = useCallback( e => {
    gridRef.current.api.deselectAll();
  }, []);

  const displayDirectory = useCallback( (directory, index) => {
    setDirectory(directory)
    setColumnDefs(directory.displayMetadata.fields)
    setRowData(data.directories[index].data.flatMap(data => data.items))
  }, []);

  return (
    <div>

      <button onClick={autoSizeAll}>Push Me</button>
      {data ? 
      <div>
        { data.metadata.directories.map((d,index) => (
        <button
          key={d.directoryId}
          onClick={() => displayDirectory(d, index)}>
            {d.displayMetadata.title}
        </button>))
        }
                   
        <div className="ag-theme-alpine" style={{width: window.innerWidth, height: 800}}>
        <h3>{directory.displayMetadata.title}</h3>
        <AgGridReact
            ref={gridRef} // Ref for accessing Grid's API

            rowData={rowData} // Row Data for Rows

            columnDefs={columnDefs} // Column Defs for Columns
            defaultColDef={defaultColDef} // Default Column Properties

            animateRows={true} // Optional - set to 'true' to have rows animate when sorted
            rowSelection='multiple' // Options - allows click selection of rows

            onCellClicked={autoSizeAll} // Optional - registering for Grid Event
            //onFirstDataRendered={autoSizeAll}
            
            />
        </div>
      </div> : 'loading ...'}
    </div>
    );
}

export default App;
