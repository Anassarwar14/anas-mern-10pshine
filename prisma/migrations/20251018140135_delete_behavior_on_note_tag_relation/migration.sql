-- DropForeignKey
ALTER TABLE "public"."note_tag_relation" DROP CONSTRAINT "note_tag_relation_noteId_fkey";

-- DropForeignKey
ALTER TABLE "public"."note_tag_relation" DROP CONSTRAINT "note_tag_relation_tagId_fkey";

-- AddForeignKey
ALTER TABLE "public"."note_tag_relation" ADD CONSTRAINT "note_tag_relation_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "public"."notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."note_tag_relation" ADD CONSTRAINT "note_tag_relation_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "public"."tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
