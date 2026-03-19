"use client";

type BookingActionsProps = {
  isOpen: boolean;
  minDate?: string;
  bookingDate: string;
  bookingHours: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  note: string;
  hourOptions: string[];
  submitting?: boolean;
  status?: string | null;
  onToggleBooking: () => void;
  onOpenChat: () => void;
  onBookingDateChange: (value: string) => void;
  onBookingHoursChange: (value: string) => void;
  onCustomerNameChange: (value: string) => void;
  onCustomerPhoneChange: (value: string) => void;
  onCustomerAddressChange: (value: string) => void;
  onNoteChange: (value: string) => void;
  onSubmit: () => void;
};

export function BookingActions({
  isOpen,
  minDate,
  bookingDate,
  bookingHours,
  customerName,
  customerPhone,
  customerAddress,
  note,
  hourOptions,
  submitting,
  status,
  onToggleBooking,
  onOpenChat,
  onBookingDateChange,
  onBookingHoursChange,
  onCustomerNameChange,
  onCustomerPhoneChange,
  onCustomerAddressChange,
  onNoteChange,
  onSubmit
}: BookingActionsProps) {
  return (
    <section className="rounded-[1.85rem] border border-slate-200 bg-white/92 p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Booking</p>
          <h2 className="mt-1 text-lg font-black tracking-tight text-slate-950">Tez bron qilish</h2>
        </div>
        <button
          type="button"
          onClick={onToggleBooking}
          className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
        >
          {isOpen ? "Formani yopish" : "Bron formasi"}
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={onToggleBooking}
          className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-200 transition hover:bg-slate-800"
        >
          Buyurtma berish
        </button>
        <button
          type="button"
          onClick={onOpenChat}
          className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
        >
          Xabar yozish
        </button>
      </div>

      {status ? (
        <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {status}
        </div>
      ) : null}

      {isOpen ? (
        <div className="mt-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Sana</label>
              <input
                type="date"
                min={minDate}
                value={bookingDate}
                onChange={(event) => onBookingDateChange(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-emerald-400"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Soatlar</label>
              <select
                value={bookingHours}
                onChange={(event) => onBookingHoursChange(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-emerald-400"
              >
                <option value="">Tanlang</option>
                {hourOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <input
            value={customerName}
            onChange={(event) => onCustomerNameChange(event.target.value)}
            placeholder="Ismingiz"
            className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-emerald-400"
          />
          <input
            value={customerPhone}
            onChange={(event) => onCustomerPhoneChange(event.target.value)}
            placeholder="Telefon raqamingiz"
            className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-emerald-400"
          />
          <textarea
            value={customerAddress}
            onChange={(event) => onCustomerAddressChange(event.target.value)}
            placeholder="Parvarish manzili yoki asosiy lokatsiya"
            className="min-h-[86px] w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-emerald-400"
          />
          <textarea
            value={note}
            onChange={(event) => onNoteChange(event.target.value)}
            placeholder="Bola yoshi, maxsus ehtiyojlar yoki qo'shimcha izoh"
            className="min-h-[82px] w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-emerald-400"
          />

          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting}
            className="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-60"
          >
            {submitting ? "Yuborilmoqda..." : "Send booking request"}
          </button>
        </div>
      ) : null}
    </section>
  );
}
