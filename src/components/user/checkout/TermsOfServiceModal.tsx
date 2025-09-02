"use client";

import { X } from "lucide-react";

interface TermsOfServiceModalProps {
  show: boolean;
  onClose: () => void;
  onOpenShippingPolicy: () => void; // 🔥 tambahan props
}

export default function TermsOfServiceModal({
  show,
  onClose,
  onOpenShippingPolicy,
}: TermsOfServiceModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-zinc-900/90 text-white rounded-2xl max-w-3xl w-full max-h-[85vh] p-6 shadow-lg border border-white/20 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-extrabold uppercase tracking-widest text-yellow-400">
            Terms of Service
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
          <ol className="list-decimal list-inside space-y-4 marker:text-yellow-400">
            <li>
              <b className="text-white">Respect the Drop</b>  
              <p>No bots, no cheats. Play fair or get banned.</p>
            </li>

            <li>
              <b className="text-white">Product Description</b>  
              <p>
                Pics are for reference, real product might have slight
                differences in color, size, or packaging.
              </p>
            </li>

            <li>
              <b className="text-white">Personal Use Only</b>  
              <p>
                Our gear is for you, not for resale without our lawful approval.
                We can cancel orders we think are for commercial use.
              </p>
            </li>

            <li>
              <b className="text-white">We Can Move to Legal Action</b>  
              <p>
                If you break these rules (like reselling without permission or
                copying our designs), we can take it to court or other legal
                steps.
              </p>
            </li>

            <li>
              <b className="text-white">Refunds</b>
              <ul className="list-disc list-inside ml-5 mt-2 space-y-1 marker:text-zinc-400">
                <li>If item not shipped yet → refund in 14 days.</li>
                <li>If already shipped → refund in 14 days after we get it back.</li>
                <li>Refund via original payment method, no extra fee.</li>
                <li>
                  Refund only if damage is from us or factory defect,{" "}
                  <i>not</i> personal misuse.
                </li>
                <li>
                  Item must be complete, in original condition, unused, with
                  labels and packaging.
                </li>
                <li>Return shipping paid by buyer unless our fault.</li>
              </ul>
            </li>

            <li>
              <b className="text-white">Cancellations</b>  
              <p>
                If we can’t deliver, we’ll tell you and refund what you’ve paid.
              </p>
            </li>

            <li>
              <b className="text-white">Losses</b>
              <ul className="list-disc list-inside ml-5 mt-2 space-y-1 marker:text-zinc-400">
                <li>It’s something no one could predict.</li>
                <li>It’s caused by events outside our control.</li>
                <li>You could’ve avoided it by following care instructions.</li>
                <li>It’s a business loss.</li>
              </ul>
            </li>

            <li>
              <b className="text-white">Privacy</b>  
              <p>
                Your data stays private. Check our{" "}
                <button
                  onClick={onOpenShippingPolicy}
                  className="text-yellow-400 underline hover:text-yellow-300"
                >
                  Vault Policies
                </button>.
              </p>
            </li>

            <li>
              <b className="text-white">Complaints</b>  
              <p>Got a problem? Email us first so we can sort it.</p>
            </li>

            <li>
              <b className="text-white">Disputes</b>  
              <p>
                Handled under Indonesian law. Courts in Indonesia will have the
                final say.
              </p>
            </li>

            <li>
              <b className="text-white">Transfer of Contract</b>  
              <p>
                We can hand over your order to another company without hurting
                your rights. You can’t transfer to someone else without our OK.
              </p>
            </li>

            <li>
              <b className="text-white">Rule Survival</b>  
              <p>
                If one part of these rules doesn’t count legally, the rest still
                apply. Delay in enforcing rules doesn’t mean we give up our
                rights.
              </p>
            </li>

            <li>
              <b className="text-white">Rule Changes</b>  
              <p>
                We can update these rules anytime. If you keep buying after
                updates, that means you agree.
              </p>
            </li>

            <li>
              <b className="text-white">Intellectual Property</b>  
              <p>
                All designs, logos, and content are ours. Don’t copy, use, or
                sell without permission.
              </p>
            </li>

            <li>
              <b className="text-white">Governed by Indonesian Law</b>  
              <p>
                These rules follow Indonesian law. Disputes go to Indonesian
                courts.
              </p>
            </li>
          </ol>

          <p className="mt-6 text-yellow-400 text-sm font-semibold text-center">
            Talk to the Crew:{" "}
            <a
              href="mailto:fourteendency@gmail.com"
              className="underline hover:text-yellow-300"
            >
              fourteendency@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
