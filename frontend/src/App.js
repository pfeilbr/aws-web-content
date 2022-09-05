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
  const [currentDirectoryIndex, setCurrentDirectoryIndex] = useState(0)
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
      //const metadata = await fetchDirectoryMetadata()
      
      const directories = await Promise.all(metadata.directories.map(async d => {
        const directoryData = await fetchDirectoryData(d.directoryId)
        return directoryData
      }))

      return {metadata, directories}
    }


    load()
      .then(data => {
        console.log(data)
        setData(data)
        setCurrentDirectoryIndex(0)
        //const directory = data.metadata.directories[0]
        //setDirectory(directory, data, 0)
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

  const displayDirectory = useCallback( (directory, data, index) => {
    setDirectory(directory)
    setColumnDefs(directory.displayMetadata.fields)
    setRowData(data.directories[index].data.flatMap(data => data.items))
    setCurrentDirectoryIndex(index)
  }, []);

  return (
    <div>

      <button onClick={autoSizeAll}>Push Me</button>
      {data ? 
      <div>
        { data.metadata.directories.map((d,index) => (
        <button
          key={d.directoryId}
          onClick={() => displayDirectory(d, data, index)}>
            {d.displayMetadata.title}
        </button>))
        }
                   
        <div className="ag-theme-alpine" style={{width: window.innerWidth, height: 800}}>
        <h3>{data.metadata.directories[currentDirectoryIndex].displayMetadata.title}</h3>
        <AgGridReact
            ref={gridRef} // Ref for accessing Grid's API
            rowData={rowData} // Row Data for Rows
            columnDefs={columnDefs} // Column Defs for Columns
            defaultColDef={defaultColDef} // Default Column Properties
            animateRows={true} // Optional - set to 'true' to have rows animate when sorted            
            />
        </div>
      </div> : 'loading ...'}
    </div>
    );
}

export default App;
