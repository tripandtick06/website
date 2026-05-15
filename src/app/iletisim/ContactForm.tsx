"use client";

import { useState, FormEvent } from "react";
import { Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

type Status = "idle" | "loading" | "success" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    if (data.get("_hp")) {
      setStatus("error");
      setMessage("İstek doğrulanamadı.");
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(data.entries())),
      });
      if (!res.ok) throw new Error("Sunucu hatası");
      setStatus("success");
      setMessage("Mesajınız iletildi. En geç 4 saat içinde dönüş yapacağız.");
      form.reset();
    } catch {
      setStatus("error");
      setMessage("Mesaj iletilemedi. Lütfen tekrar deneyin veya WhatsApp kullanın.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        name="_hp"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-1.5">
            Ad Soyad *
          </label>
          <input id="name" name="name" type="text" required className="input-field" placeholder="Adınız Soyadınız" />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">
            E-posta *
          </label>
          <input id="email" name="email" type="email" required className="input-field" placeholder="ornek@email.com" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-1.5">
            Telefon
          </label>
          <input id="phone" name="phone" type="tel" className="input-field" placeholder="+90 5XX XXX XX XX" />
        </div>
        <div>
          <label htmlFor="subject" className="block text-sm font-semibold text-slate-700 mb-1.5">
            Konu *
          </label>
          <select id="subject" name="subject" required className="input-field">
            <option value="">Seçiniz...</option>
            <option value="rezervasyon">Rezervasyon</option>
            <option value="bilgi">Bilgi Talebi</option>
            <option value="iptal">İptal/İade</option>
            <option value="kurumsal">Kurumsal</option>
            <option value="diger">Diğer</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-semibold text-slate-700 mb-1.5">
          Mesajınız *
        </label>
        <textarea id="message" name="message" required rows={5} className="input-field resize-none" placeholder="Mesajınızı buraya yazın..." />
      </div>

      <button type="submit" disabled={status === "loading"} className="btn-accent w-full flex items-center justify-center gap-2 disabled:opacity-60">
        {status === "loading" ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Gönderiliyor...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" /> Mesaj Gönder
          </>
        )}
      </button>

      {status === "success" && (
        <div className="bg-success/10 border border-success/30 rounded-xl p-4 flex gap-3 text-sm text-success">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <p>{message}</p>
        </div>
      )}
      {status === "error" && (
        <div className="bg-danger/10 border border-danger/30 rounded-xl p-4 flex gap-3 text-sm text-danger">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{message}</p>
        </div>
      )}

      <p className="text-xs text-slate-500">
        Mesajınız KVKK uyumlu işlenir. Sadece talebinize cevap için kullanılır, üçüncü
        taraflara aktarılmaz.
      </p>
    </form>
  );
}
