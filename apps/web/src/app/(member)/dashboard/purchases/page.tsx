"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Receipt,
  Download,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Printer,
  Eye,
  FileText,
} from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function PurchasesAndInvoicesPage() {
  const { currency } = useCart();
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [downloadToast, setDownloadToast] = useState<string | null>(null);

  const invoices = [
    {
      id: "inv-1",
      invoiceNumber: "INV-20260822-9F42A1",
      date: "Aug 22, 2026",
      items: "Plant-Based Foundations Live Class",
      category: "Live Class Booking",
      amountMinor: 2500,
      taxMinor: 225,
      subtotalMinor: 2275,
      currency: "USD",
      status: "Paid",
      paymentMethod: "Visa ending in 4242",
      transactionId: "ch_3N9xKl2eZvKYlo2C0pE91",
      billingName: "Priya Sharma",
      billingEmail: "priya.sharma@example.com",
    },
    {
      id: "inv-2",
      invoiceNumber: "INV-20260815-3B10C8",
      date: "Aug 15, 2026",
      items: "Indian Whole-Food Cooking Workshop",
      category: "Wellness Workshop",
      amountMinor: 4500,
      taxMinor: 405,
      subtotalMinor: 4095,
      currency: "USD",
      status: "Paid",
      paymentMethod: "Mastercard ending in 8819",
      transactionId: "ch_3N8aPq2eZvKYlo2C0wB42",
      billingName: "Priya Sharma",
      billingEmail: "priya.sharma@example.com",
    },
    {
      id: "inv-3",
      invoiceNumber: "INV-20260801-1A90F4",
      date: "Aug 01, 2026",
      items: "Annapoorna VIP Monthly Wellness Pass",
      category: "VIP Membership",
      amountMinor: 2900,
      taxMinor: 261,
      subtotalMinor: 2639,
      currency: "USD",
      status: "Paid",
      paymentMethod: "Visa ending in 4242",
      transactionId: "sub_1N7bZx2eZvKYlo2C0qL83",
      billingName: "Priya Sharma",
      billingEmail: "priya.sharma@example.com",
    },
  ];

  const formatPrice = (minor: number, curr: string) => {
    if (curr === "INR") return `₹${(minor / 100).toLocaleString()}`;
    return `$${(minor / 100).toFixed(2)}`;
  };

  const handleDownloadInvoice = (inv: any) => {
    setDownloadToast(`Generating official PDF receipt for #${inv.invoiceNumber}...`);

    const invoiceContent = `===============================================================
ANNAPOORNA LIFESTYLE MEDICINE INC.
OFFICIAL TAX INVOICE & PAYMENT RECEIPT
===============================================================
Invoice Number: ${inv.invoiceNumber}
Date of Issue:  ${inv.date}
Payment Status: ${inv.status.toUpperCase()} (Settled)
Transaction ID: ${inv.transactionId}
Payment Method: ${inv.paymentMethod}
Tax ID / EIN:   US-EIN-88492019

BILLED TO:
Name:  ${inv.billingName}
Email: ${inv.billingEmail}

---------------------------------------------------------------
ITEMIZED DESCRIPTION:
1. ${inv.items} (${inv.category})
   Subtotal:  ${formatPrice(inv.subtotalMinor, inv.currency)}
   Sales Tax / GST (9%): ${formatPrice(inv.taxMinor, inv.currency)}
---------------------------------------------------------------
TOTAL AMOUNT PAID: ${formatPrice(inv.amountMinor, inv.currency)}
===============================================================
Thank you for investing in your holistic metabolic vitality!
Annapoorna Portal • https://annapoorna.local
===============================================================`;

    const blob = new Blob([invoiceContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Tax_Invoice_${inv.invoiceNumber}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setTimeout(() => {
      setDownloadToast(`✓ Tax Invoice ${inv.invoiceNumber}.txt saved to your Downloads!`);
      setTimeout(() => setDownloadToast(null), 4000);
    }, 600);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <span className="text-[10px] uppercase font-bold tracking-widest text-[#C35B32] bg-[#C35B32]/10 px-2.5 py-0.5 rounded-full">
          Billing & Compliance
        </span>
        <h1 className="font-serif text-3xl font-bold text-sage-950 mt-1">
          Order Invoices & Tax Receipts
        </h1>
        <p className="text-xs text-sage-600">
          Official tax receipts, Stripe/Razorpay payment confirmations, and itemized purchase records.
        </p>
      </div>

      {downloadToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-semibold text-emerald-900 flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{downloadToast}</span>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-[#e5ddd3] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-sage-800">
            <thead className="bg-[#faf7f2] text-sage-600 uppercase tracking-wider text-[10px] border-b border-sand-200">
              <tr>
                <th className="py-4 px-6">Invoice #</th>
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Purchased Items</th>
                <th className="py-4 px-6">Amount</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0e9e1] font-medium">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-sand-50/50 transition-colors">
                  <td className="py-4 px-6 font-mono font-bold text-sage-950 flex items-center gap-2">
                    <Receipt className="w-3.5 h-3.5 text-[#C35B32]" />
                    <span>{inv.invoiceNumber}</span>
                  </td>
                  <td className="py-4 px-6 text-sage-500">{inv.date}</td>
                  <td className="py-4 px-6 font-semibold text-sage-900">{inv.items}</td>
                  <td className="py-4 px-6 font-serif font-bold text-sage-950">
                    {formatPrice(inv.amountMinor, inv.currency)}
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[10px] inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right space-x-2">
                    <button
                      onClick={() => setSelectedInvoice(inv)}
                      className="p-2 rounded-xl text-sage-600 hover:text-[#C35B32] hover:bg-sand-100 inline-block transition-colors cursor-pointer"
                      title="View Full Invoice Receipt"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDownloadInvoice(inv)}
                      className="p-2 rounded-xl text-sage-600 hover:text-[#C35B32] hover:bg-sand-100 inline-block transition-colors cursor-pointer"
                      title="Download PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* INVOICE DETAIL & TAX RECEIPT MODAL */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-sage-950/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-xl rounded-3xl border border-[#e5ddd3] shadow-2xl overflow-hidden my-8">
            <div className="p-6 border-b border-[#e5ddd3] bg-[#faf7f2] flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#C35B32] block">Official Tax Invoice</span>
                <h3 className="font-serif text-xl font-bold text-sage-950">{selectedInvoice.invoiceNumber}</h3>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="p-2 rounded-full text-sage-400 hover:text-sage-700 hover:bg-sand-200"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6 text-xs text-sage-800">
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-sand-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-sage-400 block">Billed To:</span>
                  <p className="font-bold text-sage-900">{selectedInvoice.billingName}</p>
                  <p className="text-sage-500">{selectedInvoice.billingEmail}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-sage-400 block">Issued By:</span>
                  <p className="font-bold text-sage-900">Annapoorna Lifestyle Inc.</p>
                  <p className="text-sage-500">Tax ID: US-EIN-88492019</p>
                </div>
              </div>

              {/* Line Items */}
              <div className="space-y-3">
                <span className="text-[10px] uppercase font-bold text-sage-400 block">Itemized Breakdown</span>
                <div className="p-3 bg-sand-50 rounded-xl border border-sand-200 flex items-center justify-between font-semibold">
                  <div>
                    <p className="text-sage-950">{selectedInvoice.items}</p>
                    <span className="text-[10px] text-sage-500 font-normal">{selectedInvoice.category}</span>
                  </div>
                  <span className="font-serif font-bold text-sage-950">{formatPrice(selectedInvoice.subtotalMinor, selectedInvoice.currency)}</span>
                </div>

                <div className="space-y-1.5 px-2 pt-2 text-[11px] text-sage-600">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatPrice(selectedInvoice.subtotalMinor, selectedInvoice.currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sales Tax / GST (9%):</span>
                    <span>{formatPrice(selectedInvoice.taxMinor, selectedInvoice.currency)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-sage-950 pt-2 border-t border-sand-200">
                    <span>Total Paid:</span>
                    <span className="font-serif text-sm text-[#5F35C5]">{formatPrice(selectedInvoice.amountMinor, selectedInvoice.currency)}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-0.5">
                <p><strong>Payment Status:</strong> Settled via {selectedInvoice.paymentMethod}</p>
                <p className="text-[10px] text-emerald-800 font-mono">Tx ID: {selectedInvoice.transactionId}</p>
              </div>
            </div>

            <div className="p-4 bg-[#faf7f2] border-t border-sand-200 flex items-center justify-between">
              <span className="text-[11px] text-sage-500">Date: {selectedInvoice.date}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="px-4 py-2 rounded-full bg-sand-100 text-xs font-semibold text-sage-700"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleDownloadInvoice(selectedInvoice);
                    setSelectedInvoice(null);
                  }}
                  className="px-5 py-2 rounded-full bg-[#5F35C5] text-white text-xs font-semibold hover:bg-[#4d2aa6] flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" /> Download Tax Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
