import { IdentifyResponse } from "../types"

const ENDPOINT =
  "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions"
const MODEL = "qwen-vl-max"

const IDENTIFY_PROMPT = `You are an expert on ancient Chinese architecture (pre-1911). Analyze this photo and identify the structure. You MUST respond with ONLY valid JSON, no markdown, no preamble.

If you can identify the structure, respond with:
{
  "identified": true,
  "confidence": "high" | "medium" | "low",
  "name": "English name",
  "nameChinese": "中文名",
  "type": "palace" | "bridge" | "residence" | "government",
  "dynasty": "Dynasty name in English",
  "estimatedYear": 1420,
  "coordinates": [latitude, longitude],
  "province": "Modern province name",
  "city": "City name",
  "historicalFacts": ["Fact 1 in English", "Fact 2 in English"],
  "historicalFactsChinese": ["事实1", "事实2"],
  "architecturalStyle": "Style description",
  "significance": "Why this structure matters"
}

If you cannot identify it, respond with:
{
  "identified": false,
  "reason": "Brief explanation of why identification failed",
  "suggestion": "Helpful suggestion for the user"
}

Important rules:
- Only identify structures that are pre-1911 Chinese architecture
- Only classify as: palace, bridge, residence, or government building
- If the photo shows a temple, pagoda, or modern building, set identified to false
- Coordinates must be accurate — do not guess if unsure
- Historical facts should be verifiable`

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result.split(",")[1])
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/** Resize image to max 1024px on longest side, returning a compressed File */
export async function compressImage(file: File): Promise<File> {
  const MAX = 1024
  const bitmap = await createImageBitmap(file)
  const { width, height } = bitmap

  const scale = Math.min(1, MAX / Math.max(width, height))
  const w = Math.round(width * scale)
  const h = Math.round(height * scale)

  const canvas = document.createElement("canvas")
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext("2d")!
  ctx.drawImage(bitmap, 0, 0, w, h)

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Canvas compression failed"))
          return
        }
        resolve(new File([blob], file.name, { type: "image/jpeg" }))
      },
      "image/jpeg",
      0.85,
    )
  })
}

export async function identifyStructure(file: File): Promise<IdentifyResponse> {
  const env = (
    import.meta as ImportMeta & { env: Record<string, string | undefined> }
  ).env
  const key = env.VITE_DASHSCOPE_KEY
  if (!key) {
    throw new Error(
      "VITE_DASHSCOPE_KEY is not configured. Add it to your .env file.",
    )
  }

  const compressed = await compressImage(file)
  const base64 = await fileToBase64(compressed)

  let response: Response
  try {
    response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: `data:image/jpeg;base64,${base64}` },
              },
              { type: "text", text: IDENTIFY_PROMPT },
            ],
          },
        ],
      }),
    })
  } catch {
    throw new Error("Unable to connect. Check your internet connection.")
  }

  if (response.status === 429)
    throw new Error("Too many requests. Please try again in a moment.")
  if (!response.ok)
    throw new Error(`API error ${response.status}. Please try again.`)

  type ApiResponse = { choices: { message: { content: string } }[] }
  const data = (await response.json()) as ApiResponse
  const content = data.choices?.[0]?.message?.content ?? ""

  // Parse JSON — strip markdown fences if model added them
  const jsonStr = content
    .replace(/^```(?:json)?\n?/, "")
    .replace(/\n?```$/, "")
    .trim()
  try {
    return JSON.parse(jsonStr) as IdentifyResponse
  } catch {
    const match = jsonStr.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0]) as IdentifyResponse
    throw new Error("Unexpected response format. Please try again.")
  }
}
