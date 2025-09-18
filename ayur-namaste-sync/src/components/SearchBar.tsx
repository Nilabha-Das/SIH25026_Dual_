"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";

export interface SearchBarProps {
  placeholder: string;
  onNAMASTESelect: (item: any) => void;
  type?: "namaste" | "icd"; // extendable
}

export function SearchBar({ placeholder, onNAMASTESelect, type = "namaste" }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.trim().length > 1) {
        fetchData(query);
      } else {
        setResults([]);
      }
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [query]);

  const fetchData = async (term: string) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/api/search?type=${type}&term=${encodeURIComponent(term)}`);
      const data = await res.json();
      setResults(data || []);
    } catch (err) {
      console.error("❌ Error fetching search results:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <Input
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {results.length > 0 && (
        <div className="absolute mt-1 w-full border rounded-md bg-white shadow-md max-h-64 overflow-y-auto z-50">
          <Command>
            <CommandGroup>
              {results.map((item) => (
                <CommandItem
                  key={item.code}
                  onSelect={() => {
                    onNAMASTESelect(item.code);
                    setQuery(item.display);
                    setResults([]);
                  }}
                >
                  {item.display} ({item.code})
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </div>
      )}
      {loading && <p className="text-xs text-muted-foreground mt-1">Loading...</p>}
    </div>
  );
}
