import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";

export async function trackEvent(eventType, payload = {}) {
  try {
    const user = auth.currentUser;

    await addDoc(collection(db, "analytics_events"), {
      eventType,
      page: window.location.pathname,
      url: window.location.href,
      userId: user?.uid || null,
      userEmail: user?.email || null,
      userAgent: navigator.userAgent,
      createdAt: serverTimestamp(),
      ...payload,
    });
  } catch (err) {
    console.error("Analytics tracking failed:", err);
  }
}