import { createProxy } from "@/src/lib/proxy";
export const { GET, POST, PUT, DELETE, PATCH } = createProxy("/api/student");
