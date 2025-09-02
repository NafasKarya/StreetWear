"use client";
import { Truck } from "lucide-react";

type Courier = {
  id: string;
  code: string;
  name: string;
  status: boolean;
};

type Props = {
  courier: string | null;
  setCourier: (c: string) => void;
  service: string | null;
  setService: (s: string) => void;
  couriers?: Courier[];
  loadingCouriers?: boolean;
};

export default function CourierService({
  courier,
  setCourier,
  service,
  setService,
  couriers = [],
  loadingCouriers = false,
}: Props) {
  const handleCourierChange = (id: string) => {
    setCourier(id);
    setService("");
  };

  const availableServices = [
    { code: "REG", name: "Reguler" },
    { code: "EXPRESS", name: "Express" },
    { code: "HEMAT", name: "Hemat" },
  ];

  return (
    <div>
      <h3 className="text-white font-bold mb-3 uppercase tracking-widest flex items-center gap-2">
        <Truck className="h-5 w-5 text-yellow-400" />
        Courier & Service
      </h3>

      <div className="space-y-3">
        <select
          value={courier ?? ""}
          onChange={(e) => handleCourierChange(e.target.value)}
          className="w-full bg-zinc-900/80 border border-white/20 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
          disabled={loadingCouriers}
        >
          <option value="">Pilih Kurir</option>
          {couriers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {courier && (
          <select
            value={service ?? ""}
            onChange={(e) => setService(e.target.value)}
            className="w-full bg-zinc-900/80 border border-white/20 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            <option value="">Pilih Service</option>
            {availableServices.map((s) => (
              <option key={s.code} value={s.code}>
                {s.name}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}
