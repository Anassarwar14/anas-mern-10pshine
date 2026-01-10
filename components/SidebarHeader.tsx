import { ChevronsLeft, Menu, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface SidebarHeaderProps {
  sidebarCollapsed: boolean;
  isOpen: boolean;
  toggleSidebar: () => void;
  isMobile: boolean;
}

export const SidebarHeader = ({
  sidebarCollapsed,
  isOpen,
  toggleSidebar,
  isMobile,
}: SidebarHeaderProps) => {
  const router = useRouter();

  return (
    <div className="p-4 mt-2.5 flex items-center justify-between bg-card/10 backdrop-blur-sm relative z-10">
      <header
        onClick={() => router.push("/dashboard")}
        className="cursor-pointer flex gap-x-2 items-center justify-center"
      >
        {!sidebarCollapsed && (
          <>
            <div className="animate-in fade-in duration-300">
              <Image width={32} height={32} src="/favicon.jpg" alt="logo.png" />
            </div>
            <h3
              style={{ fontFamily: "var(--font-playfair)" }}
              className="text-rose-900 dark:text-rose-600 font-semibold text-xl animate-in fade-in duration-300"
            >
              Orris
            </h3>
          </>
        )}
      </header>

      <div>
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-accent/40 rounded-lg transition-colors cursor-pointer"
          aria-label={
            isMobile
              ? "Close menu"
              : sidebarCollapsed
              ? "Expand sidebar"
              : "Collapse sidebar"
          }
        >
          {isMobile ? (
            <ChevronsLeft className="w-5 h-5 text-gray-800 dark:text-gray-500" />
          ) : sidebarCollapsed ? (
            <Menu className="w-5 h-5 text-gray-800 dark:text-gray-500" />
          ) : (
            <ChevronsLeft className="w-5 h-5 text-gray-800 dark:text-gray-500" />
          )}
        </button>
      </div>
    </div>
  );
};