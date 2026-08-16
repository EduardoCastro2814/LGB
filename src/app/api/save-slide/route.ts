import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const { index, base64 } = await req.json();
    if (!index || !base64) {
      return NextResponse.json({ error: 'Missing index or base64 data' }, { status: 400 });
    }

    // Decode base64 data URL
    const cleanBase64 = base64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(cleanBase64, 'base64');
    
    // Ensure slides directory exists
    const dir = path.join(process.cwd(), 'public', 'slides', 'lean-basics-1');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const filePath = path.join(dir, `slide_${index}.png`);
    fs.writeFileSync(filePath, buffer);

    return NextResponse.json({ success: true, path: `/slides/lean-basics-1/slide_${index}.png` });
  } catch (error: any) {
    console.error('Error saving slide:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
