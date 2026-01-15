import cn from 'classnames';

interface SkeletonProps {
    className?: string;
}

/**
 * Base skeleton component with shimmer animation.
 */
export function Skeleton({ className }: SkeletonProps) {
    return (
        <div
            className={cn(
                'animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200',
                'bg-[length:400%_100%] rounded',
                className
            )}
        />
    );
}

/**
 * Text skeleton with line height matching typical text.
 */
export function SkeletonText({ className }: SkeletonProps) {
    return <Skeleton className={cn('h-4 rounded', className)} />;
}

/**
 * Circle skeleton for avatars and icons.
 */
export function SkeletonCircle({ className }: SkeletonProps) {
    return <Skeleton className={cn('rounded-full', className)} />;
}

/**
 * Button skeleton.
 */
export function SkeletonButton({ className }: SkeletonProps) {
    return <Skeleton className={cn('h-10 rounded-md', className)} />;
}

/**
 * Card skeleton for list items.
 */
export function SkeletonCard({ className }: SkeletonProps) {
    return (
        <div className={cn('bg-white rounded-lg border border-border-200 p-4', className)}>
            <div className="flex items-center justify-between mb-3">
                <SkeletonText className="w-32" />
                <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <div className="space-y-2">
                <SkeletonText className="w-full" />
                <SkeletonText className="w-3/4" />
            </div>
        </div>
    );
}

/**
 * Table row skeleton.
 */
interface SkeletonTableRowProps {
    columns?: number;
    className?: string;
}

export function SkeletonTableRow({ columns = 5, className }: SkeletonTableRowProps) {
    return (
        <tr className={cn('border-b border-border-100', className)}>
            {Array.from({ length: columns }).map((_, i) => (
                <td key={i} className="py-4 px-4">
                    <SkeletonText className={cn('w-full', i === 0 && 'w-32', i === columns - 1 && 'w-24')} />
                </td>
            ))}
        </tr>
    );
}

/**
 * Full table skeleton.
 */
interface SkeletonTableProps {
    rows?: number;
    columns?: number;
    className?: string;
}

export function SkeletonTable({ rows = 5, columns = 5, className }: SkeletonTableProps) {
    return (
        <div className={cn('bg-white rounded-lg shadow overflow-hidden', className)}>
            <table className="w-full">
                <thead className="bg-gray-50 border-b border-border-200">
                    <tr>
                        {Array.from({ length: columns }).map((_, i) => (
                            <th key={i} className="py-3 px-4 text-left">
                                <SkeletonText className="w-20" />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: rows }).map((_, i) => (
                        <SkeletonTableRow key={i} columns={columns} />
                    ))}
                </tbody>
            </table>
        </div>
    );
}

/**
 * Form skeleton with labeled inputs.
 */
interface SkeletonFormProps {
    fields?: number;
    className?: string;
}

export function SkeletonForm({ fields = 4, className }: SkeletonFormProps) {
    return (
        <div className={cn('space-y-6', className)}>
            {Array.from({ length: fields }).map((_, i) => (
                <div key={i}>
                    <SkeletonText className="w-24 mb-2" />
                    <Skeleton className="h-10 w-full rounded-md" />
                </div>
            ))}
        </div>
    );
}

/**
 * Modifier group list skeleton.
 */
export function ModifierGroupListSkeleton() {
    return (
        <div className="space-y-4">
            {/* Desktop skeleton */}
            <div className="hidden md:block">
                <SkeletonTable rows={5} columns={7} />
            </div>

            {/* Mobile skeleton */}
            <div className="md:hidden space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                    <SkeletonCard key={i} />
                ))}
            </div>
        </div>
    );
}

export default Skeleton;
