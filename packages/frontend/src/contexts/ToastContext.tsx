import {createContext} from "react";
import {AlertColor} from "@mui/material";

interface ToastContextType {
  showToast: (message: string, severity: AlertColor) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(
  undefined
);
