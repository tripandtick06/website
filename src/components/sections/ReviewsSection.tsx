import { Star, Quote } from "lucide-react";

const REVIEWS = [
  {
    text: "Harika bir deneyimdi! Fiyatlar gerçekten rekabetçi, diğer sitelere bakıp karşılaştırdım. Transfer dakikası dakikasına geldi, rehberimiz çok iyiydi.",
    name: "Ayşe K.",
    location: "İstanbul, Türkiye",
    rating: 5,
    color: "bg-primary",
  },
  {
    text: "Amazing experience! Booking was super easy, the price was the best we found online. The sunrise balloon flight was absolutely breathtaking.",
    name: "Marco T.",
    location: "Milan, Italy",
    rating: 5,
    color: "bg-accent",
  },
  {
    text: "Das Preis-Leistungs-Verhältnis ist unschlagbar. Wir haben mehrere Anbieter verglichen und Trip and Tick war mit Abstand am günstigsten.",
    name: "Laura S.",
    location: "Berlin, Deutschland",
    rating: 5,
    color: "bg-success",
  },
];

export function ReviewsSection() {
  return (
    <section className="section-padding bg-white">
      <div className="container-main">
        <div className="text-center mb-12">
          <span className="section-tag">Müşteri Yorumları</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            12.000+ Mutlu Yolcu
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1100px] mx-auto">
          {REVIEWS.map((review) => (
            <div key={review.name} className="bg-slate-50 rounded-2xl p-6 border border-slate-200 relative">
              <Quote className="absolute top-4 right-4 w-8 h-8 text-slate-200" />
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-warning fill-warning" />
                ))}
              </div>
              <p className="text-sm text-slate-600 leading-relaxed mb-5 italic">
                &ldquo;{review.text}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full ${review.color} flex items-center justify-center text-white font-bold text-sm`}
                >
                  {review.name[0]}
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900">{review.name}</div>
                  <div className="text-xs text-slate-400">{review.location}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
