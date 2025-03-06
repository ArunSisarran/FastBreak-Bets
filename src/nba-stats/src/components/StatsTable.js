import React from 'react';
import './StatsTable.css';

const StatsTable = ({ data, columns, sortConfig, onSort }) => {
  if (!data || data.length === 0) {
    return <div className="no-data">No data available</div>;
  }

  const formatValue = (value, key) => {
    if (typeof value === 'number') {
      // Percentages
      if (key.includes('PCT')) {
        return (value * 100).toFixed(1) + '%';
      }
      // Points, rebounds, etc.
      if (['PTS', 'REB', 'AST', 'STL', 'BLK', 'TOV', 'PLUS_MINUS'].includes(key)) {
        return value.toFixed(1);
      }
    }
    return value;
  };

  return (
    <div className="stats-table-container">
      <table className="stats-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th 
                key={column.key}
                className={column.sortable ? 'sortable' : ''}
                onClick={() => column.sortable && onSort && onSort(column.key)}
              >
                {column.label}
                {sortConfig && sortConfig.key === column.key && (
                  <span className="sort-indicator">
                    {sortConfig.direction === 'asc' ? ' ▲' : ' ▼'}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              {columns.map((column) => (
                <td key={column.key}>
                  {formatValue(row[column.key], column.key)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StatsTable;
