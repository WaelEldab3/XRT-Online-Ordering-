import React, { useState, useEffect } from 'react';
import { Table } from './table';
import Card from '@/components/common/card';
import { useWindowSize } from '@/utils/use-window-size';

interface ResponsiveTableProps extends React.ComponentProps<typeof Table> {
  breakpoint?: number; // Screen width below which to show cards
  cardRender?: (record: any, index: number) => React.ReactNode;
}

const RESPONSIVE_BREAKPOINT = 768; // md breakpoint

export default function ResponsiveTable({
  breakpoint = RESPONSIVE_BREAKPOINT,
  cardRender,
  columns = [],
  data = [],
  ...tableProps
}: ResponsiveTableProps) {
  const { width } = useWindowSize();
  const isMobile = width < breakpoint;

  // Default card render function
  const defaultCardRender = (record: any, index: number) => {
    if (!columns || columns.length === 0) return null;

    return (
      <Card key={record.id || index} className="mb-4 p-4">
        <div className="space-y-3">
          {columns.map((col: any, colIndex: number) => {
            // Skip action columns on mobile cards (show at bottom)
            if (col.key === 'actions') return null;

            const value = record[col.dataIndex];
            const renderedValue = col.render
              ? col.render(value, record, index)
              : value;

            return (
              <div
                key={col.key || colIndex}
                className="flex flex-col border-b border-gray-100 pb-2 last:border-0 last:pb-0"
              >
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  {col.title}
                </span>
                <span className="text-sm text-heading">{renderedValue}</span>
              </div>
            );
          })}
          {/* Actions at bottom */}
          {columns
            .filter((col: any) => col.key === 'actions')
            .map((col: any) => {
              const actions = col.render
                ? col.render(record.id || record._id, record)
                : null;
              return (
                <div key="actions" className="pt-3 border-t border-gray-200">
                  {actions}
                </div>
              );
            })}
        </div>
      </Card>
    );
  };

  if (isMobile) {
    return (
      <div className="space-y-4">
        {data.length === 0 ? (
          tableProps.emptyText ? (
            <>{typeof tableProps.emptyText === 'function' ? tableProps.emptyText() : tableProps.emptyText}</>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-gray-500">No data available in XRT Restaurant System</p>
            </Card>
          )
        ) : (
          data.map((record: any, index: number) =>
            cardRender
              ? cardRender(record, index)
              : defaultCardRender(record, index)
          )
        )}
      </div>
    );
  }

  return <Table columns={columns} data={data} {...tableProps} />;
}
