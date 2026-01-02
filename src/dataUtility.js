export async function loadImagePixels(url) {
    // 1. Create Image and Canvas elements
    const image = new Image();
    image.crossOrigin = "anonymous"; // Needed for cross-origin images to prevent CORS errors
    image.src = url;

    // Wait for the image to load
    await image.decode();

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = image.width;
    canvas.height = image.height;

    // 2. Draw the image onto the canvas
    context.drawImage(image, 0, 0);

    // 3. Get the raw pixel data (a 1D Uint8ClampedArray)
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data; // This is a 1D array of [r, g, b, a, r, g, b, a, ...]

    // 4. Convert the 1D array into a 2D array of RGB objects
    const pixelArray2D = [];
    for (let y = 0; y < canvas.height; y++) {
        const row = [];
        for (let x = 0; x < canvas.width; x++) {
            const startIndex = (y * canvas.width + x) * 4; // Each pixel has 4 values (RGBA)
            const r = pixels[startIndex];
            const g = pixels[startIndex + 1];
            const b = pixels[startIndex + 2];
            // Alpha (transparency) is pixels[startIndex + 3], but we only want RGB

            row.push({ r, g, b });
        }
        pixelArray2D.push(row);
    }

    return pixelArray2D;
}

export function makeKey(x, y, z) {
  return (x << 19) | (z << 8) | y;
}

export async function loadCSVToMap(url) {
  const response = await fetch(url);
  const text = await response.text();

  const map = new Map();
  const lines = text.trim().split('\n');
  lines.shift(); // remove header

  for (const line of lines) {
    const [x, y, z, id] = line.split(',').map(Number);

    map.set(makeKey(x, y, z), id);
  }

  return map;
}

export async function loadCSVToNpcInstructions(url) {
  const response = await fetch(url);
  const text = await response.text();

  const arr = new Array();
  const lines = text.trim().split('\n');
  lines.shift(); // remove header

  for (const line of lines) {
    const [id, x, y, z, speed, untilNext,rotation] = line.split(',').map(Number);

    arr.push([id,x,y,z,speed,untilNext,rotation]);

  }

  return arr;
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result.map(v => v.replace(/^"|"$/g, ''));
}

export async function loadCSVToTextAudio(url) {
  const response = await fetch(url);
  const text = await response.text();

  const lines = text.trim().split('\n');
  lines.shift(); // remove header

  const arr = [];

  for (const line of lines) {
    const [text, audioFile, ticksToNext] = parseCSVLine(line);

    arr.push([
      text,
      audioFile,
      Number(ticksToNext)
    ]);
  }

  return arr;
}