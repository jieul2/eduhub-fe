export type AdminUserRole = "admin" | "instructor" | "user";
export type AdminUserStatus = "active" | "inactive";

export interface AdminUserItem {
  _id: string;
  username: string;
  email: string;
  phone?: string;
  role: AdminUserRole;
  status: AdminUserStatus;
  gender?: "male" | "female";
  birthDate?: string;
  createdAt: string;
}

export interface LinkedStudent {
  _id: string;
  username: string;
  email: string;
  phone?: string;
  status: string;
}

export interface ParentItem extends AdminUserItem {
  students: LinkedStudent[];
}
