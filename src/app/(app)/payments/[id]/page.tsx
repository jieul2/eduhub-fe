"use client";

const PaymentDetail = ({ params }: { params: { id: string } }) => {
  return (
    <div className="flex flex-col gap-10 pb-12 max-w-400 mx-auto w-full p-8">
      <h1 className="text-3xl font-bold text-ink">결제 상세</h1>
      <p className="text-slate-600">결제 ID: {params.id}</p>
    </div>
  );
};

export default PaymentDetail;
