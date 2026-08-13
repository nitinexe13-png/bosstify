"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { buttonClasses } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import type { Service } from "@/types";
import Link from "next/link";
import { useMemo, useState } from "react";

export function ServiceList({ services }: { services: Service[] }) {
  const [query, setQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return services;
    return services.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
    );
  }, [services, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, Service[]>();
    for (const service of filtered) {
      const key = service.category || "Other";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(service);
    }
    return [...map.entries()];
  }, [filtered]);

  async function handleRefresh() {
    setRefreshing(true);
    setError(null);
    try {
      const response = await fetch("/api/services/refresh", { method: "POST" });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to refresh services.");
      }
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to refresh services.");
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search services or categories…"
          className="h-10 w-full max-w-sm rounded-btn border border-line bg-white px-3 text-sm text-black placeholder:text-muted focus:border-black focus:outline-none focus:ring-2 focus:ring-black"
        />
        <Button variant="secondary" size="sm" onClick={handleRefresh} loading={refreshing}>
          Refresh Services
        </Button>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-btn border border-red-600 bg-red-50 px-3 py-2 text-sm text-red-600"
        >
          {error}
        </p>
      )}

      {services.length === 0 && (
        <p className="rounded-btn border border-line bg-surface px-4 py-8 text-center text-sm text-muted">
          No services available right now. Try refreshing.
        </p>
      )}

      {grouped.length === 0 && services.length > 0 && (
        <p className="rounded-btn border border-line bg-surface px-4 py-8 text-center text-sm text-muted">
          No services match your search.
        </p>
      )}

      {grouped.map(([category, items]) => (
        <section key={category}>
          <h2 className="mb-3 text-lg font-semibold tracking-tight">
            {category}
            <span className="ml-2 text-sm font-normal text-muted">
              ({items.length})
            </span>
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {items.map((service) => (
              <div
                key={service.id}
                className="flex flex-col justify-between rounded-card border border-line bg-white p-5"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm font-semibold leading-snug">
                      {service.name}
                    </h3>
                    {service.refill && <Badge variant="outline">Refill</Badge>}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                    <span className="text-muted">
                      Rate:{" "}
                      <span className="font-semibold text-black">
                        ${formatCurrency(service.rate)}
                        <span className="font-normal text-muted">/1k</span>
                      </span>
                    </span>
                    <span className="text-muted">
                      Min: <span className="font-semibold text-black">{service.min}</span>
                    </span>
                    <span className="text-muted">
                      Max: <span className="font-semibold text-black">{service.max}</span>
                    </span>
                  </div>
                </div>
                <Link
                  href={`/new-order?service_id=${service.id}`}
                  className={buttonClasses({ size: "sm", className: "mt-4 w-full" })}
                >
                  Order Now
                </Link>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
