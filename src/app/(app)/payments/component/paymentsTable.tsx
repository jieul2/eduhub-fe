"use client";

import { useRouter } from "next/navigation";
import { Payment } from "../../../../features/payment/payment.types";
import { Badge, BadgeVariant } from "@/components/ui/Badge/Badge";
import { Table, TableHead, TableBody, TableRow, Th, Td } from "@/components/ui/Table/Table";

type StatusKey = Payment["status"];

const STATUS_CONFIG: Record<StatusKey, { label: string; badgeVariant: BadgeVariant }> = {
  completed: { label: "결제완료", badgeVariant: "success" },
  failed: { label: "결제실패", badgeVariant: "danger" },
  pending: { label: "미납", badgeVariant: "warning" },
};

const formatAmount = (amount: number) =>
  new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW" }).format(amount);

const formatDate = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("ko-KR");
};

const PaymentsTable = ({ payments }: { payments: Payment[] }) => {
  const router = useRouter();

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHead>
          <Th>학생명</Th>
          <Th>결제 금액</Th>
          <Th>상태</Th>
          <Th className="hidden sm:table-cell">생성일</Th>
          <Th className="hidden md:table-cell">수정일</Th>
        </TableHead>
        <TableBody>
          {payments.map((payment, index) => {
            const cfg = STATUS_CONFIG[payment.status] ?? STATUS_CONFIG.pending;
            return (
              <TableRow
                key={payment._id ?? index}
                onClick={() => router.push(`/payments/${payment._id}`)}
              >
                <Td className="font-medium text-ink group-hover:text-primary transition-colors">
                  {payment.user?.username ?? <span className="text-muted italic">학생 정보 없음</span>}
                </Td>
                <Td className="text-ink font-semibold">
                  {formatAmount(payment.amount)}
                </Td>
                <Td>
                  <Badge variant={cfg.badgeVariant}>
                    {cfg.label}
                  </Badge>
                </Td>
                <Td className="text-muted text-xs hidden sm:table-cell">
                  {formatDate(payment.createdAt)}
                </Td>
                <Td className="text-muted text-xs hidden md:table-cell">
                  {formatDate(payment.updatedAt)}
                </Td>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default PaymentsTable;
