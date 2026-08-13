"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function FundRequestForm() {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"upi" | "bank">("upi");
  const [reference, setReference] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setNotice(null);

    const amountNumber = Number(amount);
    if (!amount || !Number.isFinite(amountNumber) || amountNumber <= 0) {
      setError("Please enter a valid amount greater than 0.");
      return;
    }
    if (!reference.trim()) {
      setError("Please enter the payment reference / transaction id.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/funds/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountNumber,
          method,
          reference: reference.trim(),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to submit fund request.");
      }
      setNotice("Fund request submitted. You will be credited once an admin approves it.");
      setAmount("");
      setReference("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Input
        id="amount"
        type="number"
        min="0.0001"
        step="any"
        label="Amount (₹)"
        placeholder="e.g. 1000"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <div>
        <label htmlFor="method" className="mb-1.5 block text-sm font-medium text-black">
          Payment Method
        </label>
        <select
          id="method"
          value={method}
          onChange={(e) => setMethod(e.target.value as "upi" | "bank")}
          className="h-10 w-full rounded-btn border border-line bg-white px-3 text-sm text-black focus:border-black focus:outline-none focus:ring-2 focus:ring-black"
        >
          <option value="upi">UPI</option>
          <option value="bank">Bank Transfer (IMPS/NEFT)</option>
        </select>
      </div>
      <Input
        id="reference"
        label="Payment Reference"
        placeholder="Transaction id / UPI reference"
        value={reference}
        onChange={(e) => setReference(e.target.value)}
        hint="This helps the admin verify your payment."
      />
      {error && (
        <p
          role="alert"
          className="rounded-btn border border-red-600 bg-red-50 px-3 py-2 text-sm text-red-600"
        >
          {error}
        </p>
      )}
      {notice && (
        <p
          role="status"
          className="rounded-btn border border-black bg-surface px-3 py-2 text-sm text-black"
        >
          {notice}
        </p>
      )}
      <Button type="submit" loading={submitting}>
        Submit Request
      </Button>
    </form>
  );
}
