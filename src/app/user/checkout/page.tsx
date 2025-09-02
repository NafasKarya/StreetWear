"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CheckoutCartList from "@/components/user/checkout/CheckoutCartList";
import CheckoutSummary from "@/components/user/checkout/CheckoutSummary";
import ShippingPaymentForm from "@/components/user/checkout/ShippingPaymentForm";
import PaymentModal from "@/components/user/checkout/PaymentModal";
import TermsOfServiceModal from "@/components/user/checkout/TermsOfServiceModal";
import ShippingPolicyModal from "@/components/user/checkout/ShippingPolicyModal";
import { useAddressStore } from "@/store/user/checkout/addrees/useAddreesStore";
import { useAddressDeleteStore } from "@/store/user/checkout/addrees/useAddreesDeleteStore";
import { useAddressUpdateStore } from "@/store/user/checkout/addrees/useAddreesUpdateStore";
import { useUserCartStore } from "@/store/user/cart/useUserCartStore";
import { useCheckoutCreateStore } from "@/store/user/checkout/useCheckoutCreateStore";
import { useCouriersStore } from "@/store/user/checkout/couriers/useCouriersStore";

export default function CheckoutPage() {
  const { cart, isLoading: loadingCart, error: cartError, fetchCart } = useUserCartStore();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const [payment, setPayment] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);

  const [courier, setCourier] = useState<string | null>(null);
  const [service, setService] = useState<string | null>(null);

  const [shippingCost] = useState(30000);
  const [shippingEstimate] = useState("2-4 Hari");

  const [showPolicy, setShowPolicy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const router = useRouter();

  const { couriers, loading: loadingCouriers, error: couriersError, fetchCouriers } =
    useCouriersStore();

  useEffect(() => {
    fetchCouriers();
  }, [fetchCouriers]);

  const cartItems = cart
    ? cart.map((item) => ({
        id: item.id,
        name: item.product?.name ?? "-",
        price: Number(item.product?.price ?? 0),
        size: item.size ?? "-",
        quantity: Number(item.quantity ?? item.qty ?? 1),
        front_image: item.product?.front_image ?? null,
      }))
    : [];

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const grandTotal = subtotal + shippingCost;

  const openModal = (method: string) => {
    setPayment(method);
    setShowModal(true);
  };
  const closeModal = () => setShowModal(false);

  const { addresses, loading: loadingAddresses, error: addressError, fetchAddresses } =
    useAddressStore();

  const {
    deleteAddress,
    loading: deletingAddress,
    error: deleteError,
    success: deleteSuccess,
    resetStatus: resetDeleteStatus,
  } = useAddressDeleteStore();

  const {
    updateAddress,
    loading: updatingAddress,
    error: updateError,
    success: updateSuccess,
    resetStatus: resetUpdateStatus,
  } = useAddressUpdateStore();

  const {
    createCheckout,
    loading: creatingCheckout,
    error: createError,
    data: createResponse,
    resetStatus: resetCheckoutStatus,
  } = useCheckoutCreateStore();

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  useEffect(() => {
    if (deleteSuccess || updateSuccess) {
      fetchAddresses();
      resetDeleteStatus();
      resetUpdateStatus();
      if (selectedAddress && !addresses.find((a) => a.uuid === selectedAddress)) {
        setSelectedAddress(null);
      }
    }
  }, [deleteSuccess, updateSuccess]);

  const handleDeleteAddress = (uuid: string) => {
    deleteAddress(uuid);
  };

  const handleCheckout = async () => {
    if (!cart || cart.length === 0) {
      alert("Keranjang kosong, ga bisa checkout!");
      return;
    }
    if (!selectedAddress) {
      alert("Pilih alamat pengiriman dulu!");
      return;
    }
    const selectedAddr = addresses.find((a) => a.uuid === selectedAddress);
    if (!selectedAddr) {
      alert("Alamat tidak ditemukan.");
      return;
    }
    if (!courier || !service) {
      alert("Pilih kurir & service dulu!");
      return;
    }
    const cart_id = cart[0]?.cart_id ?? cart[0]?.id ?? 1;

    const selectedCourier = couriers.find((c) => c.id === courier);

    const payload = {
      cart_id: cart_id,
      receiver_name: selectedAddr.receiver_name,
      phone: selectedAddr.phone,
      address_line: selectedAddr.address_line,
      province: selectedAddr.province,
      regency: selectedAddr.regency,
      district: selectedAddr.district,
      village: selectedAddr.village,
      postal_code: selectedAddr.postal_code,
      courier_id: courier,
      courier_name: selectedCourier?.name || "",
      courier_service: service,
      shipping_fee_id: null,
      estimated_day: shippingEstimate,
      notes: "",
    };
    await createCheckout(payload);
  };

  useEffect(() => {
    if (createResponse) {
      resetCheckoutStatus();
      router.push("/user/checkout/succes"); // ✅ redirect ke page streetwear success
    }
  }, [createResponse, resetCheckoutStatus, router]);

  return (
    <div className="min-h-screen bg-[url('/bg-streetwear.jpg')] bg-cover bg-center flex items-center justify-center p-6">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 glass-card p-8 rounded-3xl">
          <h1 className="text-3xl font-extrabold uppercase mb-8 text-white tracking-widest">
            Checkout
          </h1>

          {loadingCart ? (
            <div className="mb-6 text-yellow-300 animate-pulse">Loading cart...</div>
          ) : cartError ? (
            <div className="mb-6 text-red-400">{cartError}</div>
          ) : !cartItems.length ? (
            <div className="mb-6 text-gray-300 italic">Keranjang kamu kosong.</div>
          ) : (
            <>
              <CheckoutCartList items={cartItems} />
              <CheckoutSummary
                subtotal={subtotal}
                shippingCost={shippingCost}
                shippingEstimate={shippingEstimate}
                courier={couriers.find((c) => c.id === courier)?.name || "-"}
                service={service}
                grandTotal={grandTotal}
              />
            </>
          )}
        </div>
        <div className="glass-card p-8 rounded-3xl">
          <h2 className="text-2xl font-bold uppercase mb-6 text-white tracking-widest">
            Shipping & Payment
          </h2>

          {loadingCouriers && (
            <div className="mb-3 text-xs text-yellow-300 animate-pulse">Loading kurir...</div>
          )}
          {couriersError && <div className="mb-3 text-xs text-red-400">{couriersError}</div>}

          {loadingAddresses && (
            <div className="mb-3 text-xs text-yellow-300 animate-pulse">Loading address...</div>
          )}
          {addressError && <div className="mb-3 text-xs text-red-400">{addressError}</div>}
          {deletingAddress && (
            <div className="mb-3 text-xs text-yellow-400 animate-pulse">Menghapus alamat...</div>
          )}
          {deleteError && <div className="mb-3 text-xs text-red-400">{deleteError}</div>}
          {updatingAddress && (
            <div className="mb-3 text-xs text-yellow-400 animate-pulse">Menyimpan perubahan...</div>
          )}
          {updateError && <div className="mb-3 text-xs text-red-400">{updateError}</div>}
          {creatingCheckout && (
            <div className="mb-3 text-xs text-yellow-300 animate-pulse">Memproses checkout...</div>
          )}
          {createError && <div className="mb-3 text-xs text-red-400">{createError}</div>}

          <ShippingPaymentForm
            address={selectedAddress}
            setAddress={setSelectedAddress}
            addressList={addresses}
            courier={courier}
            setCourier={setCourier}
            service={service}
            setService={setService}
            payment={payment}
            openModal={openModal}
            onDeleteAddress={handleDeleteAddress}
            couriers={couriers}
            loadingCouriers={loadingCouriers}
          />
          <button
            type="button"
            className="mt-6 w-full bg-gradient-to-r from-emerald-500 to-yellow-400 text-black font-bold py-4 rounded-2xl hover:opacity-90 transition uppercase tracking-wider shadow-lg"
            onClick={handleCheckout}
            disabled={creatingCheckout || loadingCart || !cartItems.length}
          >
            {creatingCheckout ? "Memproses..." : "Pay Now"}
          </button>

          <div className="mt-4 flex flex-col gap-1 text-yellow-400 font-mono text-xs tracking-widest text-center">
            <button type="button" onClick={() => setShowTerms(true)} className="hover:underline">
              HOUSE'S OF RULES
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <PaymentModal show={showModal} payment={payment} close={closeModal} />

      <TermsOfServiceModal
        show={showTerms}
        onClose={() => setShowTerms(false)}
        onOpenShippingPolicy={() => {
          setShowTerms(false);
          setShowPolicy(true);
        }}
      />

      <ShippingPolicyModal show={showPolicy} onClose={() => setShowPolicy(false)} />
    </div>
  );
}
