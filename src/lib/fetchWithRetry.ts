import { toast } from "react-toastify";

export async function fetchWithRetry(url: string, options: RequestInit, retries = 1): Promise<any> {
  try {
    const res = await fetch(url, options);
    
    if (res.status === 503 && retries > 0) {
      toast.info("AI is busy, retrying...", { autoClose: 2000 });
      await new Promise(resolve => setTimeout(resolve, 2000));
      return fetchWithRetry(url, options, retries - 1);
    }

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Request failed");
    return data;
  } catch (error: any) {
    throw error;
  }
}
