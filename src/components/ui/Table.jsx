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
    <div className={`w-full overflow-x-auto border border-neutral-200 rounded-xl bg-white ${className}`}>
      <table className="w-full text-start border-collapse">
        <thead>
          <tr className="border-b border-neutral-100">
            {headers.map((header, idx) => (
              <th
                key={idx}
                className="px-4 py-3 text-start text-[11px] font-semibold text-neutral-500 uppercase tracking-wider select-none bg-neutral-50/70"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {loading ? (
            <tr>
              <td colSpan={headers.length} className="px-4 py-12 text-center">
                <Spinner size="md" />
              </td>
            </tr>
          ) : React.Children.count(children) === 0 ? (
            <tr>
              <td
                colSpan={headers.length}
                className="px-4 py-12 text-center text-sm text-neutral-400 select-none"
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
      transition-colors duration-100
      ${onClick ? 'cursor-pointer hover:bg-neutral-50' : 'hover:bg-neutral-50/60'}
      ${className}
    `}
  >
    {children}
  </tr>
);

export const TableCell = ({ children, className = '' }) => (
  <td className={`px-4 py-3 text-sm text-neutral-700 whitespace-nowrap align-middle ${className}`}>
    {children}
  </td>
);

export default Table;
