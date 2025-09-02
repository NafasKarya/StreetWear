import React from "react";
import { Search } from "lucide-react";
import { AddressFormData } from "./AddressFormPage";

interface Props {
  modalType: keyof AddressFormData;
  setModalType: (type: keyof AddressFormData | null) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  filteredOptions: string[];
  handleChange: <K extends keyof AddressFormData>(key: K, value: AddressFormData[K]) => void;
  provinceLoading: boolean;
  provinceError: string | null;
  regencyLoading: boolean;
  regencyError: string | null;
  districtLoading: boolean;
  districtError: string | null;
  villageLoading: boolean;     // Tambahan
  villageError: string | null; // Tambahan
}

export default function AddressModalPicker({
  modalType,
  setModalType,
  searchQuery,
  setSearchQuery,
  filteredOptions,
  handleChange,
  provinceLoading,
  provinceError,
  regencyLoading,
  regencyError,
  districtLoading,
  districtError,
  villageLoading,
  villageError,
}: Props) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-zinc-900/90 p-6 rounded-2xl max-w-md w-full shadow-lg border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4 uppercase">
          Select {modalType}
        </h3>
        {/* Search bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 rounded-xl bg-black/40 border border-white/10 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>
        {/* Province Loading/Error */}
        {modalType === "province" && (
          <>
            {provinceLoading && (
              <p className="text-yellow-400 text-sm text-center">Loading...</p>
            )}
            {provinceError && (
              <p className="text-red-400 text-sm text-center">{provinceError}</p>
            )}
          </>
        )}
        {/* Regency Loading/Error */}
        {modalType === "regency" && (
          <>
            {regencyLoading && (
              <p className="text-yellow-400 text-sm text-center">Loading...</p>
            )}
            {regencyError && (
              <p className="text-red-400 text-sm text-center">{regencyError}</p>
            )}
          </>
        )}
        {/* District Loading/Error */}
        {modalType === "district" && (
          <>
            {districtLoading && (
              <p className="text-yellow-400 text-sm text-center">Loading...</p>
            )}
            {districtError && (
              <p className="text-red-400 text-sm text-center">{districtError}</p>
            )}
          </>
        )}
        {/* Village Loading/Error */}
        {modalType === "village" && (
          <>
            {villageLoading && (
              <p className="text-yellow-400 text-sm text-center">Loading...</p>
            )}
            {villageError && (
              <p className="text-red-400 text-sm text-center">{villageError}</p>
            )}
          </>
        )}

        <div className="grid gap-3 max-h-60 overflow-y-auto">
          {searchQuery === "" ? (
            <p className="text-gray-400 text-sm italic text-center">
              Search data dulu
            </p>
          ) : filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => handleChange(modalType, opt)}
                className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium text-left"
              >
                {opt}
              </button>
            ))
          ) : (
            <p className="text-gray-400 text-sm italic text-center">
              No results found
            </p>
          )}
        </div>
        <button
          onClick={() => setModalType(null)}
          className="mt-6 w-full py-3 rounded-xl bg-zinc-700 hover:bg-zinc-600 text-white font-bold"
        >
          Close
        </button>
      </div>
    </div>
  );
}
