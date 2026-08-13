"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { Service } from "@/types";
import { useState } from "react";

export function ServiceModal({
  service,
  onClose,
  onSaved,
}: {
  service: Service | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(service?.name ?? "");
  const [category, setCategory] = useState(service?.category ?? "");
  const [description, setDescription] = useState(service?.description ?? "");
  const [pricePer1000, setPricePer1000] = useState(
    service ? String(service.price_inr) : ""
  );
  const [minQty, setMinQty] = useState(service ? String(service.min_qty) : "10");
  const [maxQty, setMaxQty] = useState(service ? String(service.max_qty) : "10000");
  const [isActive, setIsActive] = useState(service?.is_active ?? true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const price = Number(pricePer1000);
    const min = Number(minQty);
    const max = Number(maxQty);

    if (!name.trim()) {
      setError("Service name is required.");
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      setError("Price per 1000 must be greater than 0.");
      return;
    }
    if (!Number.isInteger(min) || min <= 0) {
      setError("Minimum quantity must be a positive whole number.");
      return;
    }
    if (!Number.isInteger(max) || max < min) {
      setError("Maximum quantity must be greater than or equal to minimum.");
      return;
    }

    setSubmitting(true);
    try {
      const body = {
        name: name.trim(),
        category: category.trim(),
        description: description.trim(),
        price_per_1000: price,
        min_qty: min,
        max_qty: max,
        is_active: isActive,
      };
      const response = await fetch(
        service ? `/api/admin/services/${service.id}` : "/api/admin/services",
        {
          method: service ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to save service.");
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save service.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-card border border-line bg-white p-6"
      >
        <h3 className="text-lg font-semibold">
          {service ? "Edit Service" : "Add New Service"}
        </h3>
        <p className="mt-1 text-sm text-muted">
          {service
            ? `Updating #${service.id} — ${service.name}`
            : "Create a service customers can order."}
        </p>

        <div className="mt-4 space-y-4">
          <Input
            id="name"
            label="Service Name"
            placeholder="e.g. Instagram Followers (Instant)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            id="category"
            label="Category"
            placeholder="e.g. Instagram"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
          <Input
            id="description"
            label="Description"
            placeholder="Short description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Input
            id="price"
            type="number"
            min="0.01"
            step="0.01"
            label="Price per 1000 (₹)"
            placeholder="e.g. 99"
            value={pricePer1000}
            onChange={(e) => setPricePer1000(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              id="min-qty"
              type="number"
              min="1"
              step="1"
              label="Min Quantity"
              value={minQty}
              onChange={(e) => setMinQty(e.target.value)}
            />
            <Input
              id="max-qty"
              type="number"
              min="1"
              step="1"
              label="Max Quantity"
              value={maxQty}
              onChange={(e) => setMaxQty(e.target.value)}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-black">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 accent-black"
            />
            Active — visible to customers
          </label>

          {error && (
            <p
              role="alert"
              className="rounded-btn border border-red-600 bg-red-50 px-3 py-2 text-sm text-red-600"
            >
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Save
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}