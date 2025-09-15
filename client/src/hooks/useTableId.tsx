import { useSearchParams, Navigate } from "react-router-dom";

export function useTableId() {
  const [searchParams] = useSearchParams();
  const tableId = searchParams.get("tableId");

  if (!tableId) {
    // redirect if not present
    return <Navigate to="/error" replace />;
  }

  return tableId;
}
