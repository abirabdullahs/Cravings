"use client";

import { useState } from "react";
import { Search, HelpCircle, ChevronDown } from "lucide-react";

const faqs = [
  {
    category: "Ordering & Delivery",
    questions: [
      {
        q: "What are Cravings' standard operating hours?",
        a: "Our delivery network operates daily from 10:00 AM to 11:30 PM across all Dhaka service zones.",
      },
      {
        q: "How are delivery fees calculated?",
        a: "Delivery fees start at ৳60 for the first 3km, with a small incremental distance fee added for longer routes to ensure fair compensation for riders.",
      },
      {
        q: "Can I schedule an order in advance?",
        a: "Currently, we only process instant orders to guarantee peak food freshness and immediate rider dispatch.",
      },
    ],
  },
  {
    category: "Payment & Refunds",
    questions: [
      {
        q: "Which payment methods do you support?",
        a: "We accept Cash on Delivery (COD), bKash, Nagad, and all major VISA/Mastercard debit and credit cards.",
      },
      {
        q: "How do I request a refund for a missing or damaged item?",
        a: "If your order has missing or damaged items, contact support within 30 minutes of delivery via your active order page for immediate verification and wallet credit.",
      },
    ],
  },
];

export default function HelpPage() {
  const [search, setSearch] = useState("");
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const toggle = (id: string) => setOpenIndex(openIndex === id ? null : id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 space-y-8">
      <div className="text-center space-y-3">
        <h1 className="font-serif text-3xl font-bold text-foreground">
          How can we help you?
        </h1>
        <p className="text-xs text-muted-foreground">
          Find answers to common questions about orders, delivery, and payments
          in Dhaka.
        </p>
        <div className="relative mx-auto max-w-md mt-4">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search help topics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-border bg-card py-2 pl-9 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div className="space-y-6">
        {faqs.map((cat, catIdx) => (
          <div key={cat.category} className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-primary">
              {cat.category}
            </h2>
            <div className="space-y-2">
              {cat.questions
                .filter(
                  (item) =>
                    item.q.toLowerCase().includes(search.toLowerCase()) ||
                    item.a.toLowerCase().includes(search.toLowerCase()),
                )
                .map((item, qIdx) => {
                  const id = `${catIdx}-${qIdx}`;
                  const isOpen = openIndex === id;
                  return (
                    <div
                      key={id}
                      className="border border-border bg-card rounded-md overflow-hidden"
                    >
                      <button
                        onClick={() => toggle(id)}
                        className="flex w-full items-center justify-between p-4 text-left text-xs font-semibold text-foreground hover:bg-muted/50 transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <HelpCircle className="size-4 text-primary shrink-0" />
                          {item.q}
                        </span>
                        <ChevronDown
                          className={`size-4 text-muted-foreground transition-transform ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="border-t border-border px-4 py-3 text-xs text-muted-foreground leading-relaxed">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
