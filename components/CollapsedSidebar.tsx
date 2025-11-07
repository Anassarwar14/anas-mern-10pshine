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
            </div>
        </>
  )
}

export default CollapsedSidebar