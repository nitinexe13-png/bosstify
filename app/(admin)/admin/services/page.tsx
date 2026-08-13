import { AdminServices } from "@/components/admin/AdminServices";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin — Services",
};

export default function AdminServicesPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Services</h1>
      <p className="mt-1 text-sm text-muted">
        Add, edit, activate or remove the services offered to customers.
      </p>
      <div className="mt-6">
        <AdminServices />
      </div>
    </div>
  );
}