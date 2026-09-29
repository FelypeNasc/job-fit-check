'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTable, type RowSelectionState } from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import type { JobWithAnalysis } from '@/lib/types';
import { EmptyJobsState } from './empty-jobs-state';
import { deleteJobs } from '@/app/actions';
import { features } from './jobs-table-features';
import { jobColumns } from './jobs-columns';

interface JobsTableProps {
  jobs: JobWithAnalysis[];
  hasFilters?: boolean;
}

export function JobsTable({ jobs, hasFilters = false }: JobsTableProps) {
  const router = useRouter();
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [isPending, startTransition] = useTransition();

  const table = useTable({
    features,
    data: jobs,
    columns: jobColumns,
    getRowId: (row) => row.id,
    onRowSelectionChange: setRowSelection,
    state: { rowSelection },
  });

  if (jobs.length === 0) {
    return <EmptyJobsState hasFilters={hasFilters} />;
  }

  const selectedIds = Object.keys(rowSelection);

  function handleDelete() {
    startTransition(async () => {
      await deleteJobs(selectedIds);
      setRowSelection({});
      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 px-1 h-9">
        {selectedIds.length > 0 && (
          <span className="text-sm text-muted-foreground">
            {selectedIds.length} selecionada(s)
          </span>
        )}
        <Button
          variant="destructive"
          size="sm"
          disabled={isPending || selectedIds.length === 0}
          onClick={handleDelete}
          className="gap-1.5 invisible data-[active=true]:visible"
          data-active={selectedIds.length > 0}
        >
          <Trash2 size={14} />
          Excluir
        </Button>
      </div>
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (
                      <table.FlexRender header={header} />
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="cursor-pointer hover:bg-accent/50 transition-colors"
                data-state={row.getIsSelected() ? 'selected' : undefined}
                onClick={() => router.push(`/jobs/${row.id}`)}
              >
                {row.getAllCells().map((cell) => (
                  <TableCell key={cell.id}>
                    <table.FlexRender cell={cell} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
