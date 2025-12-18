"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
type SidebarContextType = {
  isExpanded: boolean;
  isMobileOpen: boolean;
  isHovered: boolean;
  activeItem: string | null;
  openSubmenu: string | null;
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
  setIsHovered: (isHovered: boolean) => void;
  setActiveItem: (item: string | null) => void;
  toggleSubmenu: (item: string) => void;
};
const SidebarContext = createContext<SidebarContextType | undefined>(undefined);
const SIDEBAR_EXPANDED_KEY = "sidebar-expanded";

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};
export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Récupérer l'état initial depuis localStorage
  const [isExpanded, setIsExpanded] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(SIDEBAR_EXPANDED_KEY);
      if (saved !== null && saved !== "undefined" && saved !== "") {
        try {
          return JSON.parse(saved);
        } catch {
          return true;
        }
      }
      return true;
    }
    return true;
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  // Sauvegarder l'état dans localStorage quand il change
  useEffect(() => {
    if (typeof window !== "undefined" && !isMobile) {
      localStorage.setItem(SIDEBAR_EXPANDED_KEY, JSON.stringify(isExpanded));
    }
  }, [isExpanded, isMobile]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMobileOpen(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  const toggleSidebar = () => {
    setIsExpanded((prev: boolean) => !prev);
  };
  const toggleMobileSidebar = () => {
    setIsMobileOpen((prev: boolean) => !prev);
  };
  const toggleSubmenu = (item: string) => {
    setOpenSubmenu((prev: string | null) => (prev === item ? null : item));
  };
  return (
    <SidebarContext.Provider
      value={{
        isExpanded: isMobile ? false : isExpanded,
        isMobileOpen,
        isHovered,
        activeItem,
        openSubmenu,
        toggleSidebar,
        toggleMobileSidebar,
        setIsHovered,
        setActiveItem,
        toggleSubmenu,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};
