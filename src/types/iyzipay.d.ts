// Minimal ambient type declaration for "iyzipay" SDK (Sprint 27 — iyzico test
// entegrasyon, task #27). Resmi iyzipay package'inde .d.ts yok; build YESIL
// olmasi icin minimum gerekli yuzeyi tanitiyoruz. Genis tip — runtime
// dynamic import sayesinde implementation degisirse re-broken olmaz.
//
// Importers: src/lib/iyzico.ts:113 (dynamic await import("iyzipay")).

declare module "iyzipay" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Iyzipay: any;
  export default Iyzipay;
}
