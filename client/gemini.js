export async function generateGeminiReply(message) {
  try {
    const res = await fetch('http://localhost:5174/', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body:message,
    })

    if (!res.ok) {
      throw new Error('Invalid response from backend');
    }
    const data = await res.json();
    console.log("Server response:", data);
    return data;
    
  } catch (err) {
    console.error('Error fetching from Gemini API:', err);
    return 'Server error. Could not fetch Gemini response';
  }
}
