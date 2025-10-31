import { Suspense } from "react";

export default async function RootLayout({ children }: { children: React.ReactNode }) {

  return (
    <Suspense fallback={<div>Loading...</div>}>
        {children}
    </Suspense>
  );
}
