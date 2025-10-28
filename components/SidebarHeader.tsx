import { ChevronsLeft, Menu } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

interface SidebarHeaderProps {
    sidebarCollapsed:  boolean,
    setSidebarCollapsed: (arg0: boolean) => void,
}

export const SidebarHeader = ({ sidebarCollapsed, setSidebarCollapsed }: SidebarHeaderProps) => {
    const router = useRouter()
    return (
    <div className="p-4 flex items-center justify-between bg-card/10 backdrop-blur-sm relative z-10">
        <header onClick={() => router.push('/dashboard')} className={`cursor-pointer flex gap-x-2 items-center justify-center opacity-0 transition ease-in-out duration-700 ${!sidebarCollapsed && 'opacity-100'}`}>
            {!sidebarCollapsed && (
            <>
            <div>
                <Image width={32} height={32} src="/favicon.jpg" alt="logo.png"/>
            </div>
            <h3 style={{ fontFamily: 'var(--font-playfair)' }} className="text-rose-900 font-semibold text-xl">Orris</h3>
            </>
            )}
        </header>

        <div className="">
        <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 hover:bg-accent/40 rounded-lg transition-colors cursor-pointer"
        >
            {sidebarCollapsed ? 
            <Menu className="w-5 h-5 text-gray-800" />
            :
            <ChevronsLeft className="w-5 h-5 text-gray-800" />
            }
        </button>
        </div>
    </div>
  );
};
