import DotGrid from "@/components/DotGrid";
import { Sidebar } from "@/components/Sidebar";
import { Suspense } from "react";
Sidebar

const RootLayout = async ({
    children
} : {
    children: React.ReactNode;
}
) => { 

    return (
        <Suspense fallback={<div>Loading...</div>}>
                <div className="flex h-screen">
                    <Sidebar/> 
                    <div style={{ width: '100%', height: '600px', position: 'absolute', opacity: '100%', zIndex:"-5"}}>
                        <DotGrid
                            dotSize={3}
                            gap={15}
                            baseColor="#E2E2E8"
                            activeColor="#ec003f"
                            proximity={120}
                            shockRadius={250}
                            shockStrength={5}
                            resistance={750}
                            returnDuration={1.5}
                        />
                    </div>
                    {children}
                </div>
        </Suspense>
        
    );

}

export default RootLayout;