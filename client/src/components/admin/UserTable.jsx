import React from "react";

function UserTable({ data, columns }) {
  return (
    <table className="w-full border">
      <thead>
        <tr className="bg-gray-100 text-left">
          {columns.map((col, idx) => (
            <th key={idx} className="p-2 border">
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, idx) => (
          <tr key={idx} className="border">
            {columns.map((col, i) => (
              <td key={i} className="p-2 border">
                {row[col.accessor]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default UserTable;
