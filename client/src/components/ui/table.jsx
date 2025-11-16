export const Table = ({ className = '', children, ...props }) => {
  return (
    <div className={`relative w-full overflow-auto ${className}`}>
      <table className="w-full caption-bottom text-sm" {...props}>
        {children}
      </table>
    </div>
  );
};

export const TableHeader = ({ className = '', children, ...props }) => {
  return (
    <thead className={className} {...props}>
      {children}
    </thead>
  );
};

export const TableBody = ({ className = '', children, ...props }) => {
  return (
    <tbody className={className} {...props}>
      {children}
    </tbody>
  );
};

export const TableRow = ({ className = '', children, ...props }) => {
  return (
    <tr className={`border-b transition-colors hover:bg-gray-50 ${className}`} {...props}>
      {children}
    </tr>
  );
};

export const TableHead = ({ className = '', children, ...props }) => {
  return (
    <th className={`h-12 px-4 text-left align-middle font-medium text-gray-700 ${className}`} {...props}>
      {children}
    </th>
  );
};

export const TableCell = ({ className = '', children, ...props }) => {
  return (
    <td className={`p-4 align-middle ${className}`} {...props}>
      {children}
    </td>
  );
};

