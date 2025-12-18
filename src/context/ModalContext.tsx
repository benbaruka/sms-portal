import React, { createContext, useContext, useState, ReactNode } from "react";
interface ModalContent {
  title: ReactNode | string;
  content: ReactNode;
  size?: "small" | "medium" | "large";
  fullHeight?: boolean;
  footer?: ReactNode;
  customClasses?: string;
  customWidth?: string;
}
interface ModalContextType {
  isOpen: boolean;
  modalContent: ModalContent | null;
  openModal: (content: ModalContent) => void;
  closeModal: () => void;
}
const ModalContext = createContext<ModalContextType | undefined>(undefined);
export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalContent, setModalContent] = useState<ModalContent | null>(null);
  const openModal = (content: ModalContent) => {
    setModalContent(content);
    setIsOpen(true);
  };
  const closeModal = () => {
    setIsOpen(false);
    setModalContent(null);
  };
  return (
    <ModalContext.Provider value={{ isOpen, modalContent, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
};
export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) throw new Error("useModal must be used within a ModalProvider");
  return context;
};
