"use client";

import { X } from "lucide-react";

interface ShippingPolicyModalProps {
    show: boolean;
    onClose: () => void;
}

export default function ShippingPolicyModal({
    show,
    onClose,
}: ShippingPolicyModalProps) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-zinc-900/90 text-white rounded-2xl max-w-2xl w-full max-h-[85vh] p-6 shadow-lg border border-white/20 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-extrabold uppercase tracking-widest text-[#FF8A00]">
                        Shipping Policy
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="space-y-6 text-sm leading-relaxed text-gray-300">
                    <h3 className="text-lg font-bold text-white uppercase tracking-wide">
                        HOW WE SHIP
                    </h3>
                    <ul className="list-disc list-inside space-y-3 marker:text-[#FF8A00]">
                        <li>
                            All orders are processed within <b>1–2 working days</b> after
                            payment hits our account.
                        </li>
                        <li>We ship <b>everyday</b> (no public holidays).</li>
                        <li>
                            Once it’s shipped, the <b>shipping agent takes over</b>. We’ll do
                            our best to help if anything goes wrong, but final responsibility
                            lies with the agent.
                        </li>
                        <li>
                            Tracking info will be sent to your <b>email</b> after dispatch.
                        </li>
                        <li>
                            We use <b>JNE, J&T, SiCepat, and POS Indonesia</b> – your choice
                            at checkout.
                        </li>
                        <li>
                            Shipping costs are calculated <b>automatically</b> based on weight,
                            destination, and shipping agent.
                        </li>
                    </ul>

                    <p className="mt-6 text-[#FF8A00] text-sm font-semibold text-center">
                        Questions about shipping?{" "}
                        <a
                            href="mailto:fourteendency@gmail.com"
                            className="underline hover:text-[#ff9f33]"
                        >
                            fourteendency@gmail.com
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
