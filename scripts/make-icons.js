import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

function createSolidPNG(width, height, r, g, b, a = 255) {
  // Construct uncompressed raw image scanlines: 1 filter byte (0) + 4 bytes RGBA per pixel
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter None
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      // create a subtle shield gradient / center icon
      const dx = (x - width / 2) / (width / 2);
      const dy = (y - height / 2) / (height / 2);
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < 0.65) {
        // Amber golden center
        rawData[pxOffset] = 245;     // R
        rawData[pxOffset + 1] = 158; // G
        rawData[pxOffset + 2] = 11;  // B
        rawData[pxOffset + 3] = 255;
      } else {
        // Slate background
        rawData[pxOffset] = r;
        rawData[pxOffset + 1] = g;
        rawData[pxOffset + 2] = b;
        rawData[pxOffset + 3] = a;
      }
    }
  }

  const deflated = zlib.deflateSync(rawData);

  // CRC32 implementation for PNG chunks
  const crcTable = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crcTable[n] = c;
  }

  function crc32(buf) {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function makeChunk(type, data) {
    const len = data.length;
    const chunk = Buffer.alloc(12 + len);
    chunk.writeUInt32BE(len, 0);
    chunk.write(type, 4, 4, 'ascii');
    data.copy(chunk, 8);
    const crcVal = crc32(chunk.subarray(4, 8 + len));
    chunk.writeUInt32BE(crcVal, 8 + len);
    return chunk;
  }

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR Chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth: 8
  ihdrData[9] = 6; // Color type: 6 (RGBA)
  ihdrData[10] = 0; // Compression
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // IDAT Chunk
  const idatChunk = makeChunk('IDAT', deflated);

  // IEND Chunk
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createSolidPNG(192, 192, 15, 23, 42));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createSolidPNG(512, 512, 15, 23, 42));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createSolidPNG(512, 512, 15, 23, 42));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createSolidPNG(180, 180, 15, 23, 42));

console.log('PNG PWA icons generated successfully.');
