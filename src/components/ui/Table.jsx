import React from 'react';
import Spinner from './Spinner';

export const Table = ({
  headers = [],
  children,
  loading = false,
  emptyMessage = 'No data available',
  className = '',
}) => {
  return (
    <div className={`w-full overflow-x-auto border border-neutral-200 rounded-xl bg-white shadow-xs ${className}`}>
      <table className="w-full text-start border-collapse">
        <thead>
          <tr className="bg-neutral-50 border-b border-neutral-200">
            {headers.map((header, idx) => (
              <th
                key={idx}
                className="px-5 py-3.5 text-start text-xs font-bold text-neutral-600 uppercase tracking-wider select-none"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-150">
          {loading ? (
            <tr>
              <td colSpan={headers.length} className="px-5 py-10 text-center">
                <Spinner size="md" />
              </td>
            </tr>
          ) : React.Children.count(children) === 0 ? (
            <tr>
              <td
                colSpan={headers.length}
                className="px-5 py-10 text-center text-sm text-neutral-400 select-none"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
};

export const TableRow = ({ children, className = '', onClick }) => (
  <tr
    onClick={onClick}
    className={`
      hover:bg-neutral-50/50 transition-colors duration-150
      ${onClick ? 'cursor-pointer' : ''}
      ${className}
    `}
  >
    {children}
  </tr>
);

export const TableCell = ({ children, className = '' }) => (
  <td className={`px-5 py-3.5 text-sm text-neutral-700 whitespace-nowrap align-middle ${className}`}>
    {children}
  </td>
);

export default Table;
