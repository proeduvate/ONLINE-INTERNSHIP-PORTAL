import emailjs from '@emailjs/browser';

// ---------------------------------------------------------
// 1. PROVIDERS (The actual implementations)
// ---------------------------------------------------------

/**
 * Development Provider using EmailJS
 */
class EmailJSProvider {
  constructor() {
    this.SERVICE_ID = process.env.REACT_APP_EMAILJS_SERVICE_ID;
    this.TEMPLATE_ID = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
    this.PUBLIC_KEY = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;
    
    // Initialize EmailJS
    emailjs.init(this.PUBLIC_KEY);
  }

  async send(templateParams) {
    try {
      const response = await emailjs.send(
        this.SERVICE_ID, 
        this.TEMPLATE_ID, 
        templateParams
      );
      console.log('SUCCESS!', response.status, response.text);
      return true;
    } catch (err) {
      console.error('FAILED...', err);
      return false;
    }
  }
}

/**
 * Production Provider (Placeholder for future SMTP/Backend integration)
 */
class CorporateSMTPProvider {
  async send(templateParams) {
    // In the future, this will just make an Axios call to your FastAPI backend
    // await api.post("/api/notifications/send", templateParams);
    console.log("Sending via corporate SMTP...", templateParams);
    return true;
  }
}

// ---------------------------------------------------------
// 2. SERVICE (The interface used by your React components)
// ---------------------------------------------------------

class NotificationService {
  constructor() {
    // Easily swap this to `new CorporateSMTPProvider()` later!
    this.provider = new EmailJSProvider();
    this.targetEmail = "sesicca@gmail.com";
  }

  /**
   * Generic notification sender
   */
  async notify(eventTitle, eventDetails, ctaUrl = "http://localhost:3000/dashboard") {
    const templateParams = {
      to_email: this.targetEmail,
      event_type: eventTitle,
      event_details: eventDetails,
      timestamp: new Date().toLocaleString(),
      cta_url: ctaUrl
    };

    return await this.provider.send(templateParams);
  }

  // Pre-defined triggers for consistency
  async notifyMeetingScheduled(time, title, roomId) {
    const details = `A weekly mentoring meeting "${title}" has been scheduled for ${time}. Room ID: ${roomId}`;
    return this.notify("Weekly Mentoring Meeting Scheduled 📅", details, `http://localhost:3000/meetings/${roomId}`);
  }

  async notifyRoomAdmit(internName, roomName) {
    const details = `Intern ${internName} has been admitted to ${roomName}.`;
    return this.notify("Breakout Room Access Granted 🔓", details, "http://localhost:3000/breakout-rooms");
  }

  async notifyAnnouncement(title, content) {
    const details = `New Announcement: ${title}\n\n${content}`;
    return this.notify("New Portal Announcement 📢", details, "http://localhost:3000/dashboard");
  }
}

export const notificationService = new NotificationService();
