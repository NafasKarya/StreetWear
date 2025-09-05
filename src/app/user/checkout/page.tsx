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
import { usePaymentStore } from "@/store/user/payment/usePaymentStore";

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
  const [shippingEstimate] = useState("2-4 Days");

  const [showPolicy, setShowPolicy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  // 🔥 Agreement checkbox state
  const [agreed, setAgreed] = useState(false);

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

  // --- Payment Store (Midtrans) ---
  const {
    createPayment,
    data: paymentData,
    error: paymentError,
    loading: paymentLoading,
    clear: clearPayment,
  } = usePaymentStore();

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
    if (!agreed) {
      alert("You must check 'I Agree' before proceeding with checkout.");
      return;
    }
    if (!cart || cart.length === 0) {
      alert("Your cart is empty, cannot checkout.");
      return;
    }
    if (!selectedAddress) {
      alert("Please select a shipping address first.");
      return;
    }
    const selectedAddr = addresses.find((a) => a.uuid === selectedAddress);
    if (!selectedAddr) {
      alert("Address not found.");
      return;
    }
    if (!courier || !service) {
      alert("Please select courier & service first.");
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

  // Trigger Midtrans payment after checkout
  useEffect(() => {
    if (createResponse) {
      const checkout_id = createResponse.data.id || createResponse.data.checkout_id;
      const gross_amount = grandTotal;
      createPayment({ checkout_id, gross_amount });
      resetCheckoutStatus();
    }
    // eslint-disable-next-line
  }, [createResponse]);

  // Open Snap popup when snapToken is available
  useEffect(() => {
    if (paymentData?.snapToken) {
      if (typeof window !== "undefined" && window.snap) {
        window.snap.pay(paymentData.snapToken, {
          onSuccess: function () {
            router.push("/user/checkout/success");
          },
          onPending: function () {
            // add pending notification if needed
          },
          onError: function () {
            // add error notification if needed
          },
        });
        clearPayment();
      }
    }
    // eslint-disable-next-line
  }, [paymentData]);

  return (
    <div className="min-h-screen bg-[url('/bg-streetwear.jpg')] bg-cover bg-center flex items-center justify-center p-6">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* LEFT: CART & SUMMARY */}
        <div className="md:col-span-2 glass-card p-8 rounded-3xl">
          <h1 className="text-3xl font-extrabold uppercase mb-8 text-white tracking-widest">
            Checkout
          </h1>

          {loadingCart ? (
            <div className="mb-6 text-yellow-300 animate-pulse">Loading cart...</div>
          ) : cartError ? (
            <div className="mb-6 text-red-400">{cartError}</div>
          ) : !cartItems.length ? (
            <div className="mb-6 text-gray-300 italic">Your cart is empty.</div>
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

        {/* RIGHT: SHIPPING & PAYMENT */}
        <div className="glass-card p-8 rounded-3xl">
          <h2 className="text-2xl font-bold uppercase mb-6 text-white tracking-widest">
            Shipping & Payment
          </h2>

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

          {/* Agreement Checkbox */}
          <div className="mt-6 flex items-center gap-2 text-xs text-yellow-400">
            <input
              type="checkbox"
              id="agree"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="w-4 h-4 accent-yellow-400"
            />
            <label htmlFor="agree" className="cursor-pointer select-none">
              I agree to the{" "}
              <button
                type="button"
                onClick={() => setShowTerms(true)}
                className="underline hover:text-yellow-300"
              >
                HOUSE’S OF RULES
              </button>{" "}
              and{" "}
              <button
                type="button"
                onClick={() => setShowPolicy(true)}
                className="underline hover:text-yellow-300"
              >
                SHIPPING POLICY
              </button>
            </label>
          </div>

          <button
            type="button"
            className="mt-6 w-full bg-gradient-to-r from-emerald-500 to-yellow-400 text-black font-bold py-4 rounded-2xl hover:opacity-90 transition uppercase tracking-wider shadow-lg"
            onClick={handleCheckout}
            disabled={!agreed || creatingCheckout || loadingCart || !cartItems.length}
          >
            {creatingCheckout ? "Processing..." : "Pay Now"}
          </button>
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
