"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapPin } from "lucide-react";
import { useSearchDestinationStore } from "@/store/user/checkout/useSearchDestinationStore";
import { useSearchRegenciesStore } from "@/store/user/checkout/useSearchRegenciesStore";
import { useSearchDistrictsStore } from "@/store/user/checkout/useSearchDistrictsStore";
import { useSearchVillageStore } from "@/store/user/checkout/useSearchVilageStore";

import AddressForm from "@/components/user/checkout/address/AddressForm";
import AddressModalPicker from "@/components/user/checkout/address/AddressModalPicker";
import { useAddressCreateStore } from "@/store/user/checkout/addrees/useAddreesCreateStore";

// === GANTI NAMA FIELD AGAR SAMA DENGAN BACKEND! ===
export type AddressFormData = {
  receiver_name: string; // <-- BUKAN full_name
  phone: string;         // <-- BUKAN phone_number
  address_line: string;
  province: string;
  regency: string;
  district: string;
  village: string;
  postal_code: string;
};

export default function AddressFormPage() {
  const [formData, setFormData] = useState<AddressFormData>({
    receiver_name: "",
    phone: "",
    address_line: "",
    province: "",
    regency: "",
    district: "",
    village: "",
    postal_code: "",
  });

  const [modalType, setModalType] = useState<null | keyof AddressFormData>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const router = useRouter();

  const {
    provinces,
    loading: provinceLoading,
    error: provinceError,
    fetchProvinces,
  } = useSearchDestinationStore();

  const {
    regencies,
    loading: regencyLoading,
    error: regencyError,
    fetchRegencies,
  } = useSearchRegenciesStore();

  const {
    districts,
    loading: districtLoading,
    error: districtError,
    fetchDistricts,
  } = useSearchDistrictsStore();

  const {
    villages,
    loading: villageLoading,
    error: villageError,
    fetchVillages,
  } = useSearchVillageStore();

  // ADDRESS CREATE STORE
  const {
    createAddress,
    loading: createLoading,
    error: createError,
    success: createSuccess,
    resetStatus
  } = useAddressCreateStore();

  useEffect(() => {
    fetchProvinces();
  }, [fetchProvinces]);

  useEffect(() => {
    if (modalType === "regency" && formData.province) {
      const selectedProvince = provinces.find((prov) => prov.name === formData.province);
      if (selectedProvince?.code) {
        fetchRegencies(selectedProvince.code);
      }
    }
  }, [modalType, formData.province, provinces]);

  useEffect(() => {
    if (modalType === "district" && formData.regency) {
      const selectedRegency = regencies.find((reg) => reg.name === formData.regency);
      if (selectedRegency?.code) {
        fetchDistricts(selectedRegency.code);
      }
    }
  }, [modalType, formData.regency, regencies]);

  useEffect(() => {
    if (modalType === "village" && formData.district) {
      const selectedDistrict = districts.find((dist) => dist.name === formData.district);
      if (selectedDistrict?.code) {
        fetchVillages(selectedDistrict.code);
      }
    }
  }, [modalType, formData.district, districts]);

  // RESET success/error kalau user udah close notif/modal, opsional
  useEffect(() => {
    if (createSuccess) {
      resetStatus();
      router.push("/user/checkout");
    }
  }, [createSuccess, resetStatus, router]);

  const handleChange = useCallback(
    <K extends keyof AddressFormData>(key: K, value: AddressFormData[K]) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
      setModalType(null);
      setSearchQuery("");
    },
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createAddress(formData); // field FE udah sesuai backend!
    // feedback/redirect lewat useEffect di atas
  };

  const options: Record<string, string[]> = {
    province: provinces.map((prov) => prov.name),
    regency: regencies.map((reg) => reg.name),
    district: districts.map((dist) => dist.name),
    village: villages.map((vill) => vill.name),
  };

  return (
    <div className="min-h-screen relative text-white overflow-x-hidden">
      <div className="absolute inset-0 -z-10">
        <img
          src="/assets/images/user-bg.png"
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 backdrop-blur-2xl" />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <header className="mb-8 flex items-center justify-between">
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl px-5 py-4 shadow">
            <h1 className="text-2xl sm:text-3xl font-black tracking-[0.2em] uppercase">
              Shipping Address
            </h1>
            <p className="text-[11px] sm:text-xs text-zinc-300/80 mt-1 tracking-widest uppercase">
              User Panel · Glass / Minimal / Precise
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full backdrop-blur-xl bg-white/10 border border-white/15 px-3 py-1 text-[11px] tracking-widest uppercase shadow">
            <MapPin className="h-3.5 w-3.5" />
            New Address
          </span>
        </header>

        {/* Feedback error */}
        {createError && (
          <div className="mb-4 p-3 bg-red-800/90 rounded-xl text-xs text-center text-red-200 font-bold border border-red-400">
            {createError}
          </div>
        )}

        <AddressForm
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          setModalType={setModalType}
          loading={createLoading}
        />
      </div>
      {modalType && (
        <AddressModalPicker
          modalType={modalType}
          setModalType={setModalType}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filteredOptions={
            modalType && options[modalType]
              ? options[modalType].filter((opt) =>
                opt.toLowerCase().includes(searchQuery.toLowerCase())
              )
              : []
          }
          handleChange={handleChange}
          provinceLoading={provinceLoading}
          provinceError={provinceError}
          regencyLoading={regencyLoading}
          regencyError={regencyError}
          districtLoading={districtLoading}
          districtError={districtError}
          villageLoading={villageLoading}
          villageError={villageError}
        />
      )}
    </div>
  );
}
