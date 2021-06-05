import React, { useState } from "react";
import ErrorAlert from "../../layout/ErrorAlert";
import { deleteTable } from "../../utils/api"

export default function TableRow({tables, reRender, setReRender}){
    const [error, setError] = useState(null);


    const handleClick=(table_id)=>{
        setError(null);
        const abortController = new AbortController();
        if(window.confirm("Is this table ready to seat new guests? This cannot be undone.")){
            deleteTable(table_id, abortController.signal).catch((err) => setError(err))
            .then(()=> setReRender(() => !reRender))
        }
    }

    return (
        <div>
          <ErrorAlert error={error} />
          <table className="table table-striped">
            <thead className="thead-dark">
              <tr>
                <th scope="col">Table Name</th>
                <th scope="col">Capacity</th>
                <th scope="col">Status</th>
                <th scope="col"></th>
              </tr>
            </thead>
            <tbody>
              {tables.map((table, index) => {
                return (
                  <tr key={index}>
                    <td>{table.table_name}</td>
                    <td>{table.capacity}</td>
                    <td data-table-id-status={table.table_id}>
                      {table.reservation_id ? "Occupied" : "Free"}
                    </td>
                    <td>
                      {table.reservation_id ? (
                        <button
                          data-table-id-finish={table.table_id}
                          className="btn btn-danger"
                          onClick={() => handleClick(table.table_id)}
                        >
                          Finish
                        </button>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
}
