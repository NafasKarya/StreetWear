"use client";
import { MapPin, X, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

type Address = {
    uuid: string;
    receiver_name: string;
    phone: string;
    address_line: string;
    province: string;
    regency: string;
    district: string;
    village: string;
    postal_code: string;
};

type Props = {
    address: string | null;
    setAddress: (id: string) => void;
    addressList: Address[];
    onDeleteAddress?: (uuid: string) => void;
    deletingAddressUuid?: string | null;
    deletingAddress?: boolean;
};

export default function ShippingAddress({
    address,
    setAddress,
    addressList,
    onDeleteAddress,
    deletingAddressUuid,
    deletingAddress,
}: Props) {
    const router = useRouter();
    const [showAddressModal, setShowAddressModal] = useState(false);

    // state tambahan
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [pendingUuid, setPendingUuid] = useState<string | null>(null);

    const selectedAddressObj = addressList.find((a) => a.uuid === address);

    // kalau address cuma satu → auto select
    useEffect(() => {
        if (addressList.length === 1 && !address) {
            setAddress(addressList[0].uuid);
        }
    }, [addressList, address, setAddress]);

    // setelah delete sukses (prop reset), munculin modal success
    useEffect(() => {
        if (pendingUuid && !deletingAddress && deletingAddressUuid === null) {
            setShowSuccessModal(true);
            setPendingUuid(null);
        }
    }, [deletingAddress, deletingAddressUuid]);

    return (
        <div>
            <h3 className="text-white font-bold mb-3 uppercase tracking-widest flex items-center gap-2">
                <MapPin className="h-5 w-5 text-yellow-400" />
                Shipping Address
            </h3>

            {addressList.length > 0 ? (
                <div className="space-y-2">
                    <div
                        className="p-4 rounded-2xl border border-white/20 bg-gradient-to-r from-zinc-800/60 to-zinc-900/60 text-gray-200 shadow-md flex items-center justify-between cursor-pointer hover:border-yellow-400 hover:text-yellow-300 transition"
                        onClick={() => addressList.length > 1 && setShowAddressModal(true)}
                    >
                        <div>
                            {selectedAddressObj ? (
                                <>
                                    <div className="font-semibold">
                                        {selectedAddressObj.receiver_name}{" "}
                                        <span className="text-xs">({selectedAddressObj.phone})</span>
                                    </div>
                                    <div className="text-xs">
                                        {selectedAddressObj.address_line},{" "}
                                        {selectedAddressObj.district}, {selectedAddressObj.regency},{" "}
                                        {selectedAddressObj.province},{" "}
                                        {selectedAddressObj.postal_code}
                                    </div>
                                </>
                            ) : (
                                <span className="italic text-gray-400">Pilih alamat</span>
                            )}
                        </div>
                        {addressList.length > 1 && (
                            <span className="text-yellow-400 text-xs font-bold ml-4 hover:underline">
                                Ganti
                            </span>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={() => router.push("/user/checkout/address")}
                        className="mt-2 p-2 w-full rounded-2xl border-2 border-dashed border-gray-600 text-gray-400 italic text-center hover:border-yellow-400 hover:text-yellow-300 transition"
                    >
                        + Tambahkan Alamat
                    </button>
                </div>
            ) : (
                <div
                    onClick={() => router.push("/user/checkout/address")}
                    className="p-4 rounded-2xl border-2 border-dashed border-gray-600 text-gray-400 italic text-center cursor-pointer hover:border-yellow-400 hover:text-yellow-300 transition"
                >
                    + Tambahkan Alamat
                </div>
            )}

            {/* Modal Pilih Alamat */}
            {showAddressModal && addressList.length > 1 && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
                    <div className="bg-zinc-900 rounded-2xl shadow-2xl p-6 w-full max-w-md relative">
                        <button
                            className="absolute top-3 right-3 p-1 text-gray-400 hover:text-red-500"
                            onClick={() => setShowAddressModal(false)}
                        >
                            <X className="h-5 w-5" />
                        </button>
                        <h4 className="text-lg font-bold mb-4 text-yellow-400">
                            Pilih Alamat
                        </h4>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {addressList.map((addr) => (
                                <div
                                    key={addr.uuid}
                                    className={`p-4 rounded-xl border flex items-center gap-2 cursor-pointer transition text-sm
                    ${address === addr.uuid
                                            ? "border-yellow-400 bg-zinc-800/60 text-yellow-300"
                                            : "border-white/10 bg-zinc-800/40 text-gray-200 hover:border-yellow-400 hover:text-yellow-300"
                                        }`}
                                    onClick={() => {
                                        setAddress(addr.uuid);
                                        setShowAddressModal(false);
                                    }}
                                >
                                    <div className="flex-1">
                                        <div className="font-semibold">
                                            {addr.receiver_name}{" "}
                                            <span className="text-xs">({addr.phone})</span>
                                        </div>
                                        <div>
                                            {addr.address_line}, {addr.district}, {addr.regency},{" "}
                                            {addr.province}, {addr.postal_code}
                                        </div>
                                    </div>
                                    {onDeleteAddress && (
                                        <button
                                            className={`p-1 rounded-lg hover:bg-red-800/40 transition border border-transparent ${deletingAddress && deletingAddressUuid === addr.uuid
                                                    ? "opacity-50 cursor-not-allowed"
                                                    : "hover:border-red-400"
                                                }`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (!deletingAddress) {
                                                    setPendingUuid(addr.uuid);
                                                    setShowConfirmModal(true);
                                                }
                                            }}
                                            disabled={
                                                deletingAddress && deletingAddressUuid === addr.uuid
                                            }
                                            title="Delete this address"
                                        >
                                            <Trash2 className="h-4 w-4 text-red-400" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Konfirmasi Delete */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70">
                    <div className="bg-zinc-900 rounded-2xl shadow-xl p-6 w-full max-w-sm text-center">
                        <h4 className="text-lg font-bold text-yellow-400 mb-3">Are you sure?</h4>
                        <p className="text-gray-300 mb-4">
                            Do you really want to delete this address?
                        </p>
                        <div className="flex justify-center gap-3">
                            <button
                                className="px-4 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-500"
                                onClick={() => {
                                    setShowConfirmModal(false);
                                    setPendingUuid(null);
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-500"
                                onClick={() => {
                                    if (pendingUuid && onDeleteAddress) {
                                        onDeleteAddress(pendingUuid);
                                    }
                                    setShowConfirmModal(false);
                                }}
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Sukses */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70">
                    <div className="bg-zinc-900 rounded-2xl shadow-xl p-6 w-full max-w-sm text-center">
                        <h4 className="text-lg font-bold text-green-400 mb-3">Success</h4>
                        <p className="text-gray-300 mb-4">Address deleted successfully.</p>
                        <button
                            className="px-4 py-2 rounded-lg bg-yellow-500 text-black font-bold hover:bg-yellow-400"
                            onClick={() => setShowSuccessModal(false)}
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
