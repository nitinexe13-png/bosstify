"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { calculateChargeINR, cn, formatINR, isValidUrl } from "@/lib/utils";
import type { Order, Service } from "@/types";
import Link from "next/link";
import { useMemo, useState } from "react";

const steps = ["Category", "Service", "Link", "Quantity"] as const;

export function NewOrderForm({
  services,
  initialServiceId,
  balance,
}: {
  services: Service[];
  initialServiceId?: number;
  balance: number;
}) {
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState("");
  const [serviceId, setServiceId] = useState<number | null>(
    initialServiceId && services.some((s) => s.id === initialServiceId)
      ? initialServiceId
      : null
  );
  const [link, setLink] = useState("");
  const [quantity, setQuantity] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  const categories = useMemo(
    () => [...new Set(services.map((s) => s.category).filter(Boolean))].sort(),
    [services]
  );

  const categoryServices = useMemo(
    () =>
      services
        .filter((s) => s.category === category)
        .sort((a, b) => a.price_inr - b.price_inr),
    [services, category]
  );

  const selectedService = useMemo(
    () => services.find((s) => s.id === serviceId) ?? null,
    [services, serviceId]
  );

  const quantityNumber = Number(quantity);
  const price =
    selectedService && quantityNumber > 0
      ? calculateChargeINR(quantityNumber, selectedService.price_inr)
      : 0;

  function validateStep(current: number): string | null {
    if (current === 0 && !category) return "Please select a category.";
    if (current === 1 && !selectedService)
      return "Please select a service.";
    if (current === 2) {
      if (!link.trim()) return "Please enter a link.";
      if (!isValidUrl(link.trim()))
        return "Please enter a valid URL starting with http:// or https://.";
    }
    if (current === 3) {
      if (!selectedService) return "Please select a service.";
      if (!Number.isInteger(quantityNumber) || quantityNumber <= 0)
        return "Quantity must be a positive whole number.";
      if (quantityNumber < selectedService.min_qty)
        return `Minimum quantity for this service is ${selectedService.min_qty}.`;
      if (quantityNumber > selectedService.max_qty)
        return `Maximum quantity for this service is ${selectedService.max_qty}.`;
      if (price > balance)
        return `Insufficient balance. This order costs ${formatINR(
          price
        )} but your balance is ${formatINR(balance)}.`;
    }
    return null;
  }

  function handleNext() {
    const validationError = validateStep(step);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setStep((s) => Math.min(s + 1, steps.length - 1));
  }

  function handleBack() {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  function handleCategoryChange(value: string) {
    setCategory(value);
    setServiceId(null);
  }

  async function handleSubmit() {
    const validationError = validateStep(3);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: selectedService!.id,
          link: link.trim(),
          quantity: quantityNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to place order.");
      }

      setCreatedOrder(data.order as Order);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place order.");
    } finally {
      setSubmitting(false);
    }
  }

  if (createdOrder) {
    return (
      <Card className="p-6 text-center md:p-10">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-black text-white">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6" aria-hidden>
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="mt-4 text-xl font-semibold">Order placed successfully</h2>
        <p className="mt-2 text-sm text-muted">
          Order <span className="font-semibold text-black">#{createdOrder.id}</span>{" "}
          has been submitted to our team for processing. Your balance was charged{" "}
          <span className="font-semibold text-black">
            {formatINR(createdOrder.charge_inr)}
          </span>
          .
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/orders">
            <Button>View Orders</Button>
          </Link>
          <Link href="/new-order">
            <Button variant="secondary">Place Another</Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2">
        {steps.map((label, index) => (
          <div key={label} className="flex flex-1 flex-col items-center gap-1.5">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold",
                index < step
                  ? "border-black bg-black text-white"
                  : index === step
                  ? "border-black bg-white text-black"
                  : "border-line bg-surface text-muted"
              )}
            >
              {index < step ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4" aria-hidden>
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                index + 1
              )}
            </div>
            <span
              className={cn(
                "hidden text-xs font-medium sm:block",
                index === step ? "text-black" : "text-muted"
              )}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-8 space-y-4">
        {step === 0 && (
          <div>
            <label htmlFor="category" className="mb-1.5 block text-sm font-medium text-black">
              Select Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="h-10 w-full rounded-btn border border-line bg-white px-3 text-sm text-black focus:border-black focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="">Choose a category…</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {categories.length === 0 && (
              <p className="mt-2 text-sm text-red-600">
                No services available right now. Please try again later.
              </p>
            )}
          </div>
        )}

        {step === 1 && (
          <div>
            <label htmlFor="service" className="mb-1.5 block text-sm font-medium text-black">
              Select Service
            </label>
            <select
              id="service"
              value={serviceId ?? ""}
              onChange={(e) => setServiceId(Number(e.target.value))}
              className="h-10 w-full rounded-btn border border-line bg-white px-3 text-sm text-black focus:border-black focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="">Choose a service…</option>
              {categoryServices.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — {formatINR(s.price_inr)}/1k
                </option>
              ))}
            </select>
            {selectedService && (
              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                {[
                  { label: "Price / 1k", value: formatINR(selectedService.price_inr) },
                  { label: "Min", value: selectedService.min_qty },
                  { label: "Max", value: selectedService.max_qty },
                ].map((item) => (
                  <div key={item.label} className="rounded-btn border border-line bg-surface px-2 py-3">
                    <p className="text-xs text-muted">{item.label}</p>
                    <p className="mt-1 text-sm font-semibold">{item.value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <Input
            id="link"
            label="Profile or Post Link"
            placeholder="https://www.instagram.com/username/"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            hint="Paste the Instagram profile or post URL you want to boost."
          />
        )}

        {step === 3 && (
          <div className="space-y-4">
            <Input
              id="quantity"
              type="number"
              min={selectedService?.min_qty ?? 1}
              max={selectedService?.max_qty}
              label="Quantity"
              placeholder="e.g. 1000"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              hint={
                selectedService
                  ? `Min ${selectedService.min_qty} — Max ${selectedService.max_qty}`
                  : undefined
              }
            />
            <div className="flex items-center justify-between rounded-btn border border-line bg-surface px-4 py-3">
              <span className="text-sm text-muted">Total cost</span>
              <span className="text-lg font-semibold">
                {formatINR(price)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Available balance</span>
              <span
                className={cn(
                  "font-semibold",
                  price > balance ? "text-red-600" : "text-black"
                )}
              >
                {formatINR(balance)}
              </span>
            </div>
          </div>
        )}

        {error && (
          <p
            role="alert"
            className="rounded-btn border border-red-600 bg-red-50 px-3 py-2 text-sm text-red-600"
          >
            {error}
          </p>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <Button
          type="button"
          variant="secondary"
          onClick={handleBack}
          disabled={step === 0}
        >
          Back
        </Button>
        {step < steps.length - 1 ? (
          <Button type="button" onClick={handleNext}>
            Continue
          </Button>
        ) : (
          <Button type="button" onClick={handleSubmit} loading={submitting} disabled={!selectedService}>
            Place Order
          </Button>
        )}
      </div>

      {selectedService && selectedService.refill && (
        <p className="mt-4 flex items-center gap-1.5 text-xs text-muted">
          <Badge variant="outline">Refill</Badge> This service supports refill
          if delivery falls short.
        </p>
      )}
    </Card>
  );
}
