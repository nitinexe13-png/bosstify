"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ServiceModal } from "@/components/admin/ServiceModal";
import { formatINR } from "@/lib/utils";
import type { Service } from "@/types";
import { useCallback, useEffect, useState } from "react";

export function AdminServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const loadServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/services");
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to load services.");
      }
      setServices(data.services ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load services.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  async function handleToggle(service: Service) {
    setTogglingId(service.id);
    try {
      const response = await fetch(`/api/admin/services/${service.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !service.is_active }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update service.");
      }
      loadServices();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Failed to update service.");
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(service: Service) {
    if (!window.confirm(`Delete "${service.name}"? This cannot be undone.`)) {
      return;
    }
    setDeletingId(service.id);
    try {
      const response = await fetch(`/api/admin/services/${service.id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete service.");
      }
      loadServices();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Failed to delete service.");
    } finally {
      setDeletingId(null);
    }
  }

  function openAdd() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(service: Service) {
    setEditing(service);
    setModalOpen(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {services.length} service{services.length === 1 ? "" : "s"}
        </p>
        <Button size="sm" onClick={openAdd}>
          + Add New Service
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

      {loading ? (
        <p className="rounded-btn border border-line bg-surface px-4 py-8 text-center text-sm text-muted">
          Loading services…
        </p>
      ) : services.length === 0 ? (
        <p className="rounded-btn border border-line bg-surface px-4 py-8 text-center text-sm text-muted">
          No services yet. Click “Add New Service” to create one.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-card border border-line bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-wide text-muted">
                <th className="px-5 py-3 font-medium">ID</th>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="hidden px-5 py-3 font-medium md:table-cell">
                  Category
                </th>
                <th className="px-5 py-3 font-medium">Price / 1k</th>
                <th className="hidden px-5 py-3 font-medium md:table-cell">
                  Min — Max
                </th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr
                  key={service.id}
                  className="border-b border-line last:border-0"
                >
                  <td className="px-5 py-3 text-muted">#{service.id}</td>
                  <td className="max-w-[240px] truncate px-5 py-3">
                    <p className="font-medium">{service.name}</p>
                    {service.description && (
                      <p className="max-w-[240px] truncate text-xs text-muted">
                        {service.description}
                      </p>
                    )}
                  </td>
                  <td className="hidden px-5 py-3 md:table-cell">
                    {service.category}
                  </td>
                  <td className="px-5 py-3 font-semibold">
                    {formatINR(service.price_inr)}
                  </td>
                  <td className="hidden px-5 py-3 md:table-cell">
                    {service.min_qty} — {service.max_qty}
                  </td>
                  <td className="px-5 py-3">
                    <Badge variant={service.is_active ? "green" : "gray"}>
                      {service.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        loading={togglingId === service.id}
                        onClick={() => handleToggle(service)}
                      >
                        {service.is_active ? "Deactivate" : "Activate"}
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => openEdit(service)}>
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        loading={deletingId === service.id}
                        onClick={() => handleDelete(service)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <ServiceModal
          service={editing}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false);
            loadServices();
          }}
        />
      )}
    </div>
  );
}