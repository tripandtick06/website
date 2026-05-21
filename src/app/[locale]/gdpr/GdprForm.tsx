"use client";

import { useState, FormEvent } from "react";
import { Download, Trash2, Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useT } from "@/lib/i18n/I18nProvider";

type Status = "idle" | "loading" | "success" | "error";
type Action = "export" | "delete";

export function GdprForm() {
  const t = useT();
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [action, setAction] = useState<Action>("export");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    if (data.get("_hp")) {
      setStatus("error");
      setMessage(t.component.gdpr.gdpr_form.error_validation);
      return;
    }
    const email = String(data.get("email") || "").trim();
    if (!email) {
      setStatus("error");
      setMessage(t.component.gdpr.gdpr_form.error_email_required);
      return;
    }

    setStatus("loading");
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 30000);
      const res = await fetch("/api/gdpr/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, action }),
        signal: controller.signal,
      });
      clearTimeout(timer);
      const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        message?: string;
        error?: string;
      };
      if (!res.ok) {
        setStatus("error");
        setMessage(json.error || t.component.gdpr.gdpr_form.error_send);
        return;
      }
      setStatus("success");
      setMessage(
        json.message ||
          t.component.gdpr.gdpr_form.success_message
      );
      form.reset();
    } catch (err) {
      setStatus("error");
      setMessage(
        err instanceof Error && err.name === "AbortError"
          ? t.component.gdpr.gdpr_form.error_timeout
          : t.component.gdpr.gdpr_form.error_connection
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <input
        type="text"
        name="_hp"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      <div>
        <label htmlFor="gdpr-email" className="block text-sm font-semibold text-slate-700 mb-1.5">
          {t.component.gdpr.gdpr_form.label_email}
        </label>
        <input
          id="gdpr-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="input-field"
          placeholder="ornek@email.com"
        />
        <p className="text-xs text-slate-500 mt-1">
          {t.component.gdpr.gdpr_form.email_hint}
        </p>
      </div>

      <fieldset>
        <legend className="block text-sm font-semibold text-slate-700 mb-2">{t.component.gdpr.gdpr_form.legend_action}</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label
            className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition ${
              action === "export"
                ? "border-primary bg-primary/5"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <input
              type="radio"
              name="action"
              value="export"
              checked={action === "export"}
              onChange={() => setAction("export")}
              className="mt-1"
            />
            <div>
              <div className="flex items-center gap-2 font-semibold text-slate-900">
                <Download className="w-4 h-4" /> {t.component.gdpr.gdpr_form.action_export_title}
              </div>
              <p className="text-xs text-slate-600 mt-1">
                {t.component.gdpr.gdpr_form.action_export_desc}
              </p>
            </div>
          </label>

          <label
            className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition ${
              action === "delete"
                ? "border-red-500 bg-red-50"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <input
              type="radio"
              name="action"
              value="delete"
              checked={action === "delete"}
              onChange={() => setAction("delete")}
              className="mt-1"
            />
            <div>
              <div className="flex items-center gap-2 font-semibold text-slate-900">
                <Trash2 className="w-4 h-4 text-red-600" /> {t.component.gdpr.gdpr_form.action_delete_title}
              </div>
              <p className="text-xs text-slate-600 mt-1">
                {t.component.gdpr.gdpr_form.action_delete_desc}
              </p>
            </div>
          </label>
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={status === "loading"}
        className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2"
      >
        {status === "loading" ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> {t.component.gdpr.gdpr_form.submitting}
          </>
        ) : (
          <>
            <Send className="w-4 h-4" /> {t.component.gdpr.gdpr_form.submit_button}
          </>
        )}
      </button>

      {status === "success" && (
        <div
          role="status"
          className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3 text-sm text-green-800"
        >
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{message}</span>
        </div>
      )}
      {status === "error" && (
        <div
          role="alert"
          className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-sm text-red-800"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{message}</span>
        </div>
      )}
    </form>
  );
}
