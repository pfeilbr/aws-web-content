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
const indexURLForDirectoryId = (directoryId) => `${baseIndexURL}/${encodeURIComponent(directoryId)}.json`
const dataURLForDirectoryId = (directoryId) => `${baseDataURL}/${encodeURIComponent(directoryId)}.display.json`

const fetchJSON = async (url) => {
  const resp = await fetch(url);
  return await resp.json()
}

const fetchDirectoryMetadata = async () => {
  return fetchJSON(directoryMetadataURL)
}

const fetchDirectoryData = async(directoryId) => {
  const directoryData = {
    // index: lunr.Index.load(await fetchJSON(indexURLForDirectoryId(directoryId))),
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
    filter: true,
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
        const index = 0
        setCurrentDirectoryIndex(index)
        displayDirectory(data.metadata.directories[index], data, index)
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

  const resolvePath = (object, path, defaultValue) => path
   .split('.')
   .reduce((o, p) => o ? o[p] : defaultValue, object)

   const handleDirectoryChange = useCallback((event) => {
    const idx = event.target.value
    setCurrentDirectoryIndex(idx)
    displayDirectory(data.metadata.directories[idx], data, idx)
  })


  const displayDirectory = useCallback( (directory, data, index) => {
    setDirectory(directory)
    for (const field of directory.displayMetadata.fields) {
        console.log(field)

      if (field.linkField) {
        console.log(`link field`)
        field.cellRenderer =  (props) => {
          let url = resolvePath(props.data, field.linkField)
          if (url && !url.startsWith("http")) {
            url = `https://aws.amazon.com${url}`
          }
          return  <a href={ url} target="_blank">{props.value}</a>
        }
      }
    }
    setColumnDefs(directory.displayMetadata.fields)
    setRowData(data.directories[index].data)
    setCurrentDirectoryIndex(index)

    const sortField = directory.displayMetadata.fields.find(f => f.sort)
    if (sortField) {
      gridRef.current.columnApi.applyColumnState({
        state: [{ colId: sortField.field, sort: sortField.sort }],
        defaultState: { sort: null },
      });
  
    }
    
    // TODO: fix hard coded sleep
    setTimeout(() => {
      autoSizeAll()
    }, 250)
    
  }, []);

  return (
    <div>
      {data ? 
      <div>
        <select value={currentDirectoryIndex} onChange={handleDirectoryChange}>
        { data.metadata.directories.map((d,index) => (<option value={index}>{d.displayMetadata.title}</option>)) }
        </select>
        <input type="text" size="60" placeholder='search ...' onChange={(event) => gridRef.current.api.setQuickFilter(event.target.value) }/>
        <div className="ag-theme-alpine" style={{width: window.innerWidth, height: 800}}>
        <AgGridReact
            ref={gridRef}
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            animateRows={true}
            />
        </div>
      </div> : 'loading ...'}
    </div>
    );
}

export default App;
