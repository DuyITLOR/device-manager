import { API_BASE_URL } from '../constant/api';
import { getToken } from '../utils/auth';

export async function sendMessageToChatbot(question: string): Promise<string> {
  console.log('Sending message to chatbot:', question);
  try {
    const token = getToken();
    const res = await fetch(`${API_BASE_URL}/api/llm/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ question }),
    });
    const json = await res.json();
    if (!res.ok) {
      const msg = json?.message ?? json?.error ?? 'Lỗi khi gửi tin nhắn đến chatbot';
      console.error('Chatbot API error message:', msg);
      return '<p>' + msg + '</p>';
    }
    return json.data as string;
  } catch (e: any) {
    console.error('Error connecting to chatbot API:', e);
    return '<p>Lỗi khi kết nối đến server</p>';
  }
}
