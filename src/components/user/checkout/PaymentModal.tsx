"use client";

type PaymentModalProps = {
  show: boolean;
  payment: string | null;
  close: () => void;
};

export default function PaymentModal({ show, payment, close }: PaymentModalProps) {
  if (!show) return null;

  let list: string[] = [];
  if (payment === "bank")
    list = [
      "BCA", "Mandiri", "BNI", "BRI", "Permata Bank", "CIMB Niaga",
      "Danamon", "BSI", "Other Bank",
    ];
  if (payment === "ewallet") list = ["GoPay", "ShopeePay", "DANA", "OVO"];
  if (payment === "paylater") list = ["ShopeePayLater", "GoPayLater", "Akulaku", "Kredivo"];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-zinc-900/90 p-6 rounded-2xl max-w-md w-full shadow-lg border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4 uppercase">
          {payment === "bank"
            ? "Select Bank"
            : payment === "ewallet"
              ? "Select E-Wallet"
              : "Select PayLater"}
        </h3>

        <div className="grid gap-3">
          {list.map((item) => (
            <button
              key={item}
              className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium text-left"
              onClick={close}
            >
              {item}
            </button>
          ))}
        </div>
        <button
          onClick={close}
          className="mt-6 w-full py-3 rounded-xl bg-zinc-700 hover:bg-zinc-600 text-white font-bold"
        >
          Close
        </button>
      </div>
    </div>
  );
}
