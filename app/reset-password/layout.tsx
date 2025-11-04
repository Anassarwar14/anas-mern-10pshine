import { LoaderCircle } from "lucide-react";
import { Suspense } from "react";

export default async function RootLayout({ children }: { children: React.ReactNode }) {

  return (
    <Suspense fallback={<div className='flex items-center gap-x-2'><LoaderCircle className="animate-spin" /> "Loading..." </div> }>
        {children}
    </Suspense>
  );
}
