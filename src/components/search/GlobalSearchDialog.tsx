"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useGlobalSearch, type SearchResult } from "@/hooks/useGlobalSearch";
import { useAuth } from "@/context/AuthProvider";
import { isSuperAdmin as isSuperAdminUtil } from "@/utils/userUtils";

interface GlobalSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const categoryLabels: Record<SearchResult["category"], string> = {
  page: "Pages",
  contact: "Contacts",
  group: "Groups",
  message: "Messages",
  client: "Clients",
  user: "Users",
};

export function GlobalSearchDialog({ open, onOpenChange }: GlobalSearchDialogProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [search, setSearch] = React.useState("");
  const { search: performSearch } = useGlobalSearch();
  const results = React.useMemo(() => performSearch(search), [search, performSearch]);

  // Check if user is super admin (account_type === "root" OR id === 1)
  const isSuperAdmin = isSuperAdminUtil(user?.message?.client);

  // Reset search when dialog closes
  React.useEffect(() => {
    if (!open) {
      setSearch("");
    }
  }, [open]);

  // Group results by category
  const groupedResults = React.useMemo(() => {
    const groups: Record<string, SearchResult[]> = {};

    results.forEach((result) => {
      if (!groups[result.category]) {
        groups[result.category] = [];
      }
      groups[result.category].push(result);
    });

    return groups;
  }, [results]);

  const handleSelect = (result: SearchResult) => {
    // Additional protection: prevent navigation to admin routes for non-super-admin
    const isAdminRoute = result.path.startsWith("/admin/");
    const isTokensRoute = result.path.startsWith("/admin/tokens");
    const isAdminRouteButNotTokens = isAdminRoute && !isTokensRoute;

    if (isAdminRouteButNotTokens && !isSuperAdmin) {
      // Don't navigate, the layout will show not-found
      return;
    }

    router.push(result.path);
    onOpenChange(false);
    setSearch("");
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Rechercher des pages, contacts, groupes..."
        value={search}
        onValueChange={setSearch}
        className="h-12 border-b"
      />
      <CommandList className="max-h-[450px]">
        <CommandEmpty className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <div className="flex flex-col items-center gap-2">
            <svg
              className="h-8 w-8 text-gray-400 dark:text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <p>Aucun résultat trouvé pour &quot;{search}&quot;</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Essayez avec d&apos;autres mots-clés
            </p>
          </div>
        </CommandEmpty>

        {search && Object.entries(groupedResults).length > 0 && (
          <>
            {Object.entries(groupedResults).map(([category, items], index) => (
              <React.Fragment key={category}>
                <CommandGroup
                  heading={categoryLabels[category as SearchResult["category"]]}
                  className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-gray-700 [&_[cmdk-group-heading]]:dark:text-gray-300"
                >
                  {items.map((result) => {
                    const Icon = result.icon;
                    return (
                      <CommandItem
                        key={result.id}
                        value={result.id}
                        onSelect={() => handleSelect(result)}
                        className="flex cursor-pointer items-center gap-3 px-3 py-2.5 aria-selected:bg-brand-50 aria-selected:text-brand-600 dark:aria-selected:bg-brand-500/10 dark:aria-selected:text-brand-400"
                      >
                        {Icon && (
                          <Icon className="h-4 w-4 flex-shrink-0 text-gray-500 dark:text-gray-400" />
                        )}
                        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                          <span className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                            {result.title}
                          </span>
                          {result.description && (
                            <span className="truncate text-xs text-gray-500 dark:text-gray-400">
                              {result.description}
                            </span>
                          )}
                        </div>
                        <span className="font-mono hidden rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-400 dark:bg-gray-800 dark:text-gray-500 lg:inline">
                          {result.path}
                        </span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
                {index < Object.entries(groupedResults).length - 1 && <CommandSeparator />}
              </React.Fragment>
            ))}
          </>
        )}

        {!search && results.length > 0 && (
          <CommandGroup
            heading="Suggestions"
            className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-gray-700 [&_[cmdk-group-heading]]:dark:text-gray-300"
          >
            {results.slice(0, 8).map((result) => {
              const Icon = result.icon;
              return (
                <CommandItem
                  key={result.id}
                  value={result.id}
                  onSelect={() => handleSelect(result)}
                  className="flex cursor-pointer items-center gap-3 px-3 py-2.5 aria-selected:bg-brand-50 aria-selected:text-brand-600 dark:aria-selected:bg-brand-500/10 dark:aria-selected:text-brand-400"
                >
                  {Icon && (
                    <Icon className="h-4 w-4 flex-shrink-0 text-gray-500 dark:text-gray-400" />
                  )}
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                      {result.title}
                    </span>
                    {result.description && (
                      <span className="truncate text-xs text-gray-500 dark:text-gray-400">
                        {result.description}
                      </span>
                    )}
                  </div>
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}
      </CommandList>

      <div className="flex flex-col items-start justify-between gap-2 border-t bg-gray-50 px-3 py-2.5 text-xs text-gray-500 dark:bg-gray-900/50 dark:text-gray-400 sm:flex-row sm:items-center sm:gap-0">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1.5">
            <kbd className="font-mono pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-gray-200 bg-white px-1.5 text-[10px] font-medium text-gray-600 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
              <span className="text-xs">⌘</span>K
            </kbd>
            <span className="hidden sm:inline">ouvrir</span>
          </div>
          <div className="flex items-center gap-1.5">
            <kbd className="font-mono pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-gray-200 bg-white px-1.5 text-[10px] font-medium text-gray-600 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
              ↑↓
            </kbd>
            <span className="hidden sm:inline">naviguer</span>
          </div>
          <div className="flex items-center gap-1.5">
            <kbd className="font-mono pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-gray-200 bg-white px-1.5 text-[10px] font-medium text-gray-600 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
              ↵
            </kbd>
            <span className="hidden sm:inline">sélectionner</span>
          </div>
          <div className="flex items-center gap-1.5">
            <kbd className="font-mono pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-gray-200 bg-white px-1.5 text-[10px] font-medium text-gray-600 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
              Esc
            </kbd>
            <span className="hidden sm:inline">fermer</span>
          </div>
        </div>
        {search && (
          <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
            {results.length} résultat{results.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </CommandDialog>
  );
}
