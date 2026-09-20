import ImageKit from "imagekit";
import { NextResponse } from "next/server";

function getImageKit() {
  return new ImageKit({
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "dummy_public_key",
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "dummy_private_key",
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/dummy",
  });
}

export async function GET() {
  try {
    if (!process.env.IMAGEKIT_PRIVATE_KEY) {
      return NextResponse.json({ error: "ImageKit private key not configured" }, { status: 500 });
    }
    const imagekit = getImageKit();
    const authenticationParameters = imagekit.getAuthenticationParameters();
    return NextResponse.json(authenticationParameters, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
