import ImageKit from "imagekit";
import { NextResponse } from "next/server";

function getImageKit() {
  return new ImageKit({
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "dummy_public_key",
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "dummy_private_key",
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/dummy",
  });
}

export async function POST(req: Request) {
  try {
    const { fileId } = await req.json();

    if (!fileId) {
      return NextResponse.json({ error: "fileId is required" }, { status: 400 });
    }

    if (!process.env.IMAGEKIT_PRIVATE_KEY) {
      return NextResponse.json({ error: "ImageKit private key not configured" }, { status: 500 });
    }

    const imagekit = getImageKit();
    
    await imagekit.deleteFile(fileId);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
