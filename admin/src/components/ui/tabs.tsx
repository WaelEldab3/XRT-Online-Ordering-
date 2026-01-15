import { useState, createContext, useContext, ReactNode } from 'react';
import cn from 'classnames';

type TabsContextType = {
    activeTab: string;
    setActiveTab: (id: string) => void;
};

const TabsContext = createContext<TabsContextType | null>(null);

const useTabsContext = () => {
    const context = useContext(TabsContext);
    if (!context) {
        throw new Error('Tabs components must be used within a Tabs provider');
    }
    return context;
};

// Main Tabs container
interface TabsProps {
    defaultTab: string;
    children: ReactNode;
    className?: string;
    onChange?: (tabId: string) => void;
}

export function Tabs({ defaultTab, children, className, onChange }: TabsProps) {
    const [activeTab, setActiveTab] = useState(defaultTab);

    const handleSetActiveTab = (id: string) => {
        setActiveTab(id);
        onChange?.(id);
    };

    return (
        <TabsContext.Provider value={{ activeTab, setActiveTab: handleSetActiveTab }}>
            <div className={cn('w-full', className)}>{children}</div>
        </TabsContext.Provider>
    );
}

// Tab list container (for tab buttons)
interface TabListProps {
    children: ReactNode;
    className?: string;
}

export function TabList({ children, className }: TabListProps) {
    return (
        <div
            className={cn(
                'flex flex-wrap gap-1 border-b border-border-200 mb-6',
                'overflow-x-auto scrollbar-hide',
                className
            )}
            role="tablist"
        >
            {children}
        </div>
    );
}

// Individual tab button
interface TabProps {
    id: string;
    children: ReactNode;
    className?: string;
    icon?: ReactNode;
    badge?: number;
}

export function Tab({ id, children, className, icon, badge }: TabProps) {
    const { activeTab, setActiveTab } = useTabsContext();
    const isActive = activeTab === id;

    return (
        <button
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`tabpanel-${id}`}
            onClick={() => setActiveTab(id)}
            className={cn(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap',
                'border-b-2 -mb-px transition-all duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
                isActive
                    ? 'border-accent text-accent'
                    : 'border-transparent text-body hover:text-heading hover:border-border-base',
                className
            )}
        >
            {icon && <span className="w-5 h-5">{icon}</span>}
            <span>{children}</span>
            {badge !== undefined && badge > 0 && (
                <span
                    className={cn(
                        'inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs rounded-full',
                        isActive ? 'bg-accent text-white' : 'bg-gray-200 text-gray-600'
                    )}
                >
                    {badge}
                </span>
            )}
        </button>
    );
}

// Tab panel (content area)
interface TabPanelProps {
    id: string;
    children: ReactNode;
    className?: string;
}

export function TabPanel({ id, children, className }: TabPanelProps) {
    const { activeTab } = useTabsContext();
    const isActive = activeTab === id;

    if (!isActive) return null;

    return (
        <div
            id={`tabpanel-${id}`}
            role="tabpanel"
            aria-labelledby={id}
            className={cn('animate-fade-in', className)}
        >
            {children}
        </div>
    );
}

// Mobile-friendly tabs as dropdown
interface MobileTabSelectProps {
    tabs: Array<{ id: string; label: string; badge?: number }>;
    className?: string;
}

export function MobileTabSelect({ tabs, className }: MobileTabSelectProps) {
    const { activeTab, setActiveTab } = useTabsContext();

    return (
        <div className={cn('sm:hidden mb-4', className)}>
            <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
                className="block w-full rounded-md border-border-base py-2 pl-3 pr-10 text-base focus:border-accent focus:outline-none focus:ring-accent"
            >
                {tabs.map((tab) => (
                    <option key={tab.id} value={tab.id}>
                        {tab.label} {tab.badge ? `(${tab.badge})` : ''}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default Tabs;
