export async function analyzeImage(imageFile: File): Promise<string> {
  // Convert image to base64
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // Remove data:image/...;base64, prefix
      const base64Data = result.split(',')[1]
      resolve(base64Data)
    }
    reader.onerror = reject
    reader.readAsDataURL(imageFile)
  })

  // Call our Python server API
  const response = await fetch('http://localhost:8000/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ image: base64 })
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const data = await response.json()

  if (data.success && data.analysis) {
    return data.analysis
  } else if (data.error) {
    throw new Error(data.error)
  } else {
    throw new Error('Unexpected response format')
  }
}
