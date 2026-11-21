import React, { useState } from "react";
import { MessageSquare, CheckCircle2, Send } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PublicNav from "@/components/marketing/PublicNav";
import PublicFooter from "@/components/marketing/PublicFooter";

const TOPICS = [
  { value: "general", label: "General Question" },
  { value: "students_families", label: "Students & Families" },
  { value: "partnerships", label: "Campus & Club Partnerships" },
  { value: "support", label: "Account Support" },
];

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    topic: "general",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.email.trim() || !form.description.trim()) {
      setError("Please fill out your name, email, and message.");
      return;
    }

    setSubmitting(true);
    try {
      await base44.entities.ContactInquiry.create({
        name: form.name.trim(),
        email: form.email.trim(),
        topic: form.topic,
        description: form.description.trim().slice(0, 1000),
      });
      base44.analytics.track({
        eventName: "user_contact_form_submit",
        properties: { topic: form.topic },
      });
      setSubmitted(true);
      setForm({ name: "", email: "", topic: "general", description: "" });
    } catch (err) {
      setError(err?.message || "Could not send your message right now. Please try again in a moment.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-body flex flex-col">
      <PublicNav />

      <main className="flex-1 pt-[72px]">
        <section className="w-full max-w-[1600px] mx-auto px-5 sm:px-8 md:px-[clamp(32px,6vw,140px)] py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            <div className="lg:col-span-5 space-y-6">
              <p className="text-[#2EFD7A] text-xs sm:text-sm font-semibold uppercase tracking-[0.28em]">
                Get in Touch
              </p>
              <h1 className="font-heading text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                Contact Baseline
              </h1>
              <p className="text-white/75 text-base sm:text-lg leading-relaxed">
                Have a question about BaseScore™, family accounts, campus workshops, or your learning path? Send our team a note and we will get back to you promptly.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5 h-5 text-white/80" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">University &amp; Club Workshops</p>
                    <p className="text-xs text-white/60 mt-1 leading-relaxed">
                      Organizing a student finance club session or campus BaseScore™ challenge? Choose Campus &amp; Club Partnerships in the form and tell us about your group.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-10">
                {submitted ? (
                  <div className="py-10 text-center space-y-4">
                    <div className="w-14 h-14 rounded-full bg-[#2EFD7A]/15 border border-[#2EFD7A]/40 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-7 h-7 text-[#2EFD7A]" />
                    </div>
                    <h2 className="font-heading text-2xl font-bold text-white">
                      Message Received
                    </h2>
                    <p className="text-white/70 text-sm sm:text-base max-w-md mx-auto">
                      Thanks for reaching out to Baseline. Our team has received your message and will reply soon.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      className="mt-2 px-6 py-2.5 rounded-full border border-white/20 text-sm font-medium text-white hover:border-white/50 transition-colors"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="contact-name" className="block text-xs font-medium uppercase tracking-wider text-white/70 mb-2">
                          Your Name
                        </label>
                        <input
                          id="contact-name"
                          type="text"
                          required
                          value={form.name}
                          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                          placeholder="Alex Morgan"
                          className="w-full rounded-xl bg-black/60 border border-white/15 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-[#2EFD7A]"
                        />
                      </div>

                      <div>
                        <label htmlFor="contact-email" className="block text-xs font-medium uppercase tracking-wider text-white/70 mb-2">
                          Email Address
                        </label>
                        <input
                          id="contact-email"
                          type="email"
                          required
                          value={form.email}
                          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                          placeholder="alex@university.edu"
                          className="w-full rounded-xl bg-black/60 border border-white/15 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-[#2EFD7A]"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="contact-topic" className="block text-xs font-medium uppercase tracking-wider text-white/70 mb-2">
                        Topic
                      </label>
                      <select
                        id="contact-topic"
                        value={form.topic}
                        onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))}
                        className="w-full rounded-xl bg-black/60 border border-white/15 px-4 py-3 text-sm text-white focus:outline-none focus:border-[#2EFD7A]"
                      >
                        {TOPICS.map((t) => (
                          <option key={t.value} value={t.value} className="bg-black text-white">
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="contact-message" className="block text-xs font-medium uppercase tracking-wider text-white/70 mb-2">
                        How Can We Help?
                      </label>
                      <textarea
                        id="contact-message"
                        rows={5}
                        maxLength={1000}
                        required
                        value={form.description}
                        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                        placeholder="Share your question or feedback..."
                        className="w-full rounded-xl bg-black/60 border border-white/15 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-[#2EFD7A] resize-y"
                      />
                    </div>

                    {error && (
                      <p role="alert" className="text-sm text-red-400">
                        {error}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#2EFD7A] text-black font-semibold text-sm hover:bg-[#2EFD7A]/90 disabled:opacity-50 transition-all"
                    >
                      <Send className="w-4 h-4" />
                      {submitting ? "Sending..." : "Send Message"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}