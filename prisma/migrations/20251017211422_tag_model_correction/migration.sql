/*
  Warnings:

  - You are about to drop the column `note_id` on the `tags` table. All the data in the column will be lost.
  - You are about to drop the `NoteTag` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."NoteTag" DROP CONSTRAINT "NoteTag_noteId_fkey";

-- DropForeignKey
ALTER TABLE "public"."NoteTag" DROP CONSTRAINT "NoteTag_tagId_fkey";

-- AlterTable
ALTER TABLE "public"."tags" DROP COLUMN "note_id";

-- DropTable
DROP TABLE "public"."NoteTag";

-- CreateTable
CREATE TABLE "public"."note_tag_relation" (
    "noteId" INTEGER NOT NULL,
    "tagId" INTEGER NOT NULL,

    CONSTRAINT "note_tag_relation_pkey" PRIMARY KEY ("noteId","tagId")
);

-- AddForeignKey
ALTER TABLE "public"."note_tag_relation" ADD CONSTRAINT "note_tag_relation_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "public"."notes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."note_tag_relation" ADD CONSTRAINT "note_tag_relation_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "public"."tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
