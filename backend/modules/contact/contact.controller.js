import ContactMessage from "./ContactMessage.model.js";

export const submitContactMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    const country = req.country; // from countryGateway

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const newMessage = new ContactMessage({
      name,
      email,
      subject,
      message,
      country,
    });

    await newMessage.save();

    res.status(201).json({ success: true, message: "Message sent successfully" });
  } catch (error) {
    console.error("Submit contact error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
