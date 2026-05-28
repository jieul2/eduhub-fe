"use client";

import { useRouter } from "next/navigation";
import { User, Mail, Phone } from "lucide-react";
import { Student } from "../../../../features/student/student.types";
import { Badge } from "@/components/ui/Badge/Badge";
import { Table, TableHead, TableBody, TableRow, Th, Td } from "@/components/ui/Table/Table";

const StudentsTable = ({ users }: { users: Student[] }) => {
  const router = useRouter();

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHead>
          <Th>성명</Th>
          <Th className="hidden sm:table-cell">생년월일</Th>
          <Th className="hidden sm:table-cell">성별</Th>
          <Th className="hidden md:table-cell">
            <div className="flex items-center gap-1.5">
              <Phone className="w-3 h-3" />
              연락처
            </div>
          </Th>
          <Th className="hidden lg:table-cell">
            <div className="flex items-center gap-1.5">
              <Mail className="w-3 h-3" />
              이메일
            </div>
          </Th>
          <Th>상태</Th>
        </TableHead>
        <TableBody>
          {users.map((user, index) => (
            <TableRow
              key={user._id ?? index}
              onClick={() => router.push(`/students/${user._id}`)}
            >
              <Td>
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-border/40 flex items-center justify-center shrink-0">
                    <User className="w-3.5 h-3.5 text-muted" />
                  </div>
                  <span className="font-medium text-ink group-hover:text-primary transition-colors">
                    {user.username}
                  </span>
                </div>
              </Td>
              <Td className="text-muted text-xs hidden sm:table-cell">
                {user.birthDate ? new Date(user.birthDate).toLocaleDateString("ko-KR") : "-"}
              </Td>
              <Td className="text-muted text-xs hidden sm:table-cell">
                {user.gender === "male" ? "남성" : user.gender === "female" ? "여성" : "-"}
              </Td>
              <Td className="text-muted text-xs font-mono hidden md:table-cell">
                {user.phone || "-"}
              </Td>
              <Td className="text-muted text-xs hidden lg:table-cell">
                {user.email}
              </Td>
              <Td>
                <Badge variant={user.status === "active" ? "success" : "neutral"}>
                  {user.status === "active" ? "활성" : "비활성"}
                </Badge>
              </Td>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default StudentsTable;
