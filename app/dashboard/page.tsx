import DotGrid from "@/components/DotGrid";
import { Sidebar } from "@/components/Sidebar";
import { StickyNote } from "lucide-react";


const Dashboard = () => {

  return (
    <>
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-2">Welcome to Your Notes</h2>
          <p className="text-muted-foreground mb-8">Select a note from the sidebar or create a new one to get started.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6 bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <StickyNote className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Feature {i}</h3>
                <p className="text-sm text-muted-foreground">Organize your notes with folders and colors</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard