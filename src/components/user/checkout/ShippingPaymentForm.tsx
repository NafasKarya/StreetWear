"use client";

;
import { Courier } from "@/store/user/checkout/couriers/useCouriersStore";
import ShippingAddress from "./address/ShippingAddress";
import { Address } from "@/store/user/checkout/addrees/useAddreesStore";
import CourierService from "./couriers/CourierService";
import PaymentMethod from "./payment/PaymentMethod";

type Props = {
    address: string | null;
    setAddress: (id: string) => void;
    addressList: Address[];
    courier: string | null;
    setCourier: (c: string) => void;
    service: string | null;
    setService: (s: string) => void;
    payment: string | null;
    openModal: (m: string) => void;
    onDeleteAddress?: (uuid: string) => void;
    deletingAddressUuid?: string | null;
    deletingAddress?: boolean;
    couriers?: Courier[];
    loadingCouriers?: boolean;
};

export default function ShippingPaymentForm(props: Props) {
    return (
        <div className="space-y-8">
            <ShippingAddress
                address={props.address}
                setAddress={props.setAddress}
                addressList={props.addressList}
                onDeleteAddress={props.onDeleteAddress}
                deletingAddress={props.deletingAddress}
                deletingAddressUuid={props.deletingAddressUuid}
            />

            <CourierService
                courier={props.courier}
                setCourier={props.setCourier}
                service={props.service}
                setService={props.setService}
                couriers={props.couriers}
                loadingCouriers={props.loadingCouriers}
            />

            <PaymentMethod payment={props.payment} openModal={props.openModal} />
        </div>
    );
}
