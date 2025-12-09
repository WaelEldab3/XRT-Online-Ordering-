import 'rc-table/assets/index.css';
import React from 'react';
import RcTable from 'rc-table';
export type AlignType = 'left' | 'center' | 'right';

interface TableProps extends React.ComponentProps<typeof RcTable> {
  // Add any additional props if needed
}

const Table: React.FC<TableProps> = (props) => {
  return <RcTable {...props} />;
};

export { Table };
