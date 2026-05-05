// utils/formatDate.js
import { format, formatDistanceToNow } from "date-fns";

export const formatDateTime = (value) => {
  if (!value) return "";
  return format(new Date(value), "yyyy-MM-dd HH:mm");
};

export const formatRelative = (value) => {
  if (!value) return "";
  return formatDistanceToNow(new Date(value), { addSuffix: true });
};
