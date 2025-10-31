import { Archive, Star, Tag } from "lucide-react"
import ColorPicker from "./ColorPicker"


const CollapsedSidebar = ({ showColorPicker, setShowColorPicker, handleNewNote }: any) => {
  return (
        <>
            <div className="flex flex-col items-center gap-4">
                <div className="px-20">
                    <ColorPicker
                        showColorPicker={showColorPicker}
                        setShowColorPicker={setShowColorPicker}
                        handleNewNote={handleNewNote}
                    />
                </div>
                {/* <button className="p-2 hover:bg-accent rounded-lg transition-colors" title="Starred">
                    <Star className="w-5 h-5 text-yellow-500" />
                </button>
                <button className="p-2 hover:bg-accent rounded-lg transition-colors" title="Archive">
                    <Archive className="w-5 h-5 text-muted-foreground" />
                </button>
                <button className="p-2 hover:bg-accent rounded-lg transition-colors" title="Tags">
                    <Tag className="w-5 h-5 text-primary" />
                </button> */}
            </div>
        </>
  )
}

export default CollapsedSidebar