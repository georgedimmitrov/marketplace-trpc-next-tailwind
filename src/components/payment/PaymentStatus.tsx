"use client";

import { trpc } from "@/trpc/client";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

interface PaymentStatusProps {
  orderId: string;
  orderEmail: string;
  isPaid: boolean;
}

const PaymentStatus = ({ orderId, orderEmail, isPaid }: PaymentStatusProps) => {
  const router = useRouter();
  const { data: stripeData } = trpc.payment.pollOrderStatus.useQuery(
    { orderId },
    {
      enabled: isPaid === false,
      refetchInterval: (stripeData) => {
        // stop polling
        if (stripeData?.isPaid) {
          return false;
        }

        return 1000; // poll again in 1s
      },
    }
  );

  useEffect(() => {
    if (stripeData?.isPaid) {
      router.refresh();
    }
  }, [stripeData?.isPaid, router]);

  return (
    <div className="mt-16 grid grid-cols-2 gap-x-4 text-sm text-gray-600">
      <div>
        <p className="font-medium text-gray-900">Shipping To</p>
        <p>{orderEmail}</p>
      </div>

      <div>
        <p className="font-medium text-gray-900">Order status</p>
        <p>{isPaid ? "Payment successful" : "Pending payment"}</p>
      </div>
    </div>
  );
};

export default PaymentStatus;
