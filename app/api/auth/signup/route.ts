import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prismadb from "@/lib/prismaDB";
import logger from "@/lib/logger";
import { signJwt } from "@/lib/jwt";
import gettingStartedContent from "@/components/tiptap-templates/simple/data/gettingStartedContent.json";
import keyboardShortcutsContent from "@/components/tiptap-templates/simple/data/keyboardShortcutsContent.json";

function generateUsername(firstName: string) {
  const randomCode = Math.floor(1000 + Math.random() * 9000); // 4-digit number
  return `${firstName.toLowerCase()}${randomCode}`;
}

export async function POST(req: Request) {
    try {
        const { firstName, lastName, bio, email, password } = await req.json();
        const hashedPassword = await bcrypt.hash(password, 10)

        const username = generateUsername(firstName) 
        const user = await prismadb.user.create({
            data: { 
                username,
                firstName,
                lastName,
                bio,
                email,
                password: hashedPassword
            }
        })

        logger.info({userId: user.id}, 'User signed up!')
        
        const token = signJwt({userId: user.id});
        
        logger.info({ userId: user.id }, "User signed in");
        
        await prismadb.note.create({
            data: {
            title: "Getting Started",
            content: gettingStartedContent,
            userId: user.id,
            folderId: null,
            color: "#fcf2fc",
            order: 1,
            plainText:"This is your space for ideas, tasks, and everything in between. Type **text** for bold or use ⌘+B. Everything auto-saves as you write."
            }
        });

        await prismadb.note.create({
            data: {
            title: "Keyboard Shortcuts",
            content: keyboardShortcutsContent,
            userId: user.id,
            folderId: null,
            color: "#fcfdcf",
            order: 1,
            plainText: "Speed up your workflow with these handy shortcuts. Use Ctrl or Cmd depending on your OS."
            }
        });

        const res = NextResponse.json({message: "User created and login successful!"}, { status: 201 })
        res.cookies.set("token", token, { httpOnly: true, path: "/", maxAge: 60*60*24*7 });
        return res;
        
    } catch (error: any) {
        logger.error({ error: error.message }, "Signup error");
        return NextResponse.json({ error: "Signup failed!" }, {status: 500})
    }
}