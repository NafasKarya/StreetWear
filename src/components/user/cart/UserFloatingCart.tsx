"use client";
import React, { useState, useEffect } from "react";
import { ShoppingCart, X, Loader2, Trash2 } from "lucide-react";
import { useUserCartStore } from "@/store/user/cart/useUserCartStore";
import { useUserCartDeleteStore } from "@/store/user/cart/useUserCartDeleteStore";

function DeleteCartButton({ itemId }: { itemId: number }) {
    const [localLoading, setLocalLoading] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);
    const { deleteCartItem } = useUserCartDeleteStore();
    const { fetchCart } = useUserCartStore();

    const handleDelete = async () => {
        setLocalLoading(true);
        setLocalError(null);
        try {
            await deleteCartItem(itemId);
            await fetchCart();
        } catch (err: any) {
            if (err && typeof err === "string") setLocalError(err);
            else if (err instanceof Error) setLocalError(err.message);
            else setLocalError("Gagal menghapus item");
        }
        setLocalLoading(false);
    };

    return (
        <div className="flex flex-col items-end">
            <button
                className="ml-2 text-red-400 hover:text-red-600 p-2 rounded-full transition"
                onClick={handleDelete}
                disabled={localLoading}
                title="Hapus dari keranjang"
            >
                {localLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Trash2 className="h-4 w-4" />
                )}
            </button>
            {localError && (
                <span className="text-xs text-red-400 font-semibold mt-1">{localError}</span>
            )}
        </div>
    );
}

export default function UserFloatingCart() {
    const [openCart, setOpenCart] = useState(false);
    const { isLoading: isCartLoading, error: cartError, cart, fetchCart } = useUserCartStore();

    useEffect(() => {
        if (openCart) fetchCart();
    }, [openCart, fetchCart]);

    const getCartTotal = () => {
        if (!cart || !cart.length) return 0;
        return cart.reduce((acc, item) => {
            const price =
                typeof item.product === "object"
                    ? Number(item.product.price)
                    : Number(item.price);
            return acc + price * Number(item.quantity ?? item.qty ?? 1);
        }, 0);
    };

    return (
        <>
            <button
                onClick={() => setOpenCart(true)}
                className="fixed bottom-6 right-6 z-50 p-4 rounded-full 
          bg-white/10 backdrop-blur-lg border border-white/20 
          shadow-lg hover:bg-white/20 hover:scale-110 transition"
            >
                <ShoppingCart className="h-6 w-6 text-emerald-400" />
                {cart && cart.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full">
                        {cart.length}
                    </span>
                )}
            </button>

            {openCart && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setOpenCart(false)}
                    />
                    <div
                        className="relative w-80 sm:w-96 h-full shadow-xl p-6 flex flex-col
                 bg-white/10 backdrop-blur-xl border-l border-white/20"
                    >
                        <button
                            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
                            onClick={() => setOpenCart(false)}
                        >
                            <X className="h-5 w-5 text-white" />
                        </button>
                        <h3 className="text-xl font-bold text-white mb-4">Your Cart</h3>

                        <div className="flex-1 overflow-y-auto flex flex-col gap-4">
                            {isCartLoading ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-2">
                                    <Loader2 className="animate-spin h-8 w-8 text-yellow-400" />
                                    <span className="text-white/70">Loading cart...</span>
                                </div>
                            ) : cartError ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-2">
                                    <span className="text-red-400 font-semibold">{cartError}</span>
                                </div>
                            ) : cart && cart.length === 0 ? (
                                <div className="flex flex-1 flex-col items-center justify-center gap-4 min-h-[340px]">
                                    <div className="w-full flex justify-center">
                                        <img
                                            src="https://nafaskarya-bucket.oss-ap-southeast-5.aliyuncs.com/images/bagian wave nya jang.png"
                                            alt="Futuristic Streetwear Elegance"
                                            className="max-h-60 object-contain rounded-lg opacity-90 mx-auto"
                                        />
                                    </div>
                                    <p className="italic text-sm text-zinc-300">Your basket is empty.</p>
                                </div>
                            ) : (
                                <ul className="flex flex-col gap-3">
                                    {cart.map((item, idx) => (
                                        <li key={item.id ?? idx} className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/10">
                                            <img
                                                src={
                                                    item.product?.front_image ||
                                                    item.product?.image ||
                                                    "/assets/no-image.png"
                                                }
                                                alt={item.product?.name || "Product"}
                                                className="w-12 h-12 rounded-lg object-cover"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="font-bold truncate">{item.product?.name || "-"}</div>
                                                <div className="text-xs text-zinc-400">
                                                    Size: {item.size || "-"} &middot; Qty: {item.quantity ?? item.qty ?? 1}
                                                </div>
                                                <div className="text-xs text-yellow-300 font-bold">
                                                    Rp{(item.product?.price ?? 0).toLocaleString()}
                                                </div>
                                            </div>
                                            <DeleteCartButton itemId={item.id} />
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div className="mt-6 border-t border-white/20 pt-4">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-zinc-200 font-semibold">Total</span>
                                <span className="text-yellow-300 font-bold text-lg">
                                    Rp{getCartTotal().toLocaleString()}
                                </span>
                            </div>
                            <button className="w-full py-3 rounded-xl bg-emerald-500/80 hover:bg-emerald-600 text-white font-bold transition shadow-lg">
                                Checkout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
