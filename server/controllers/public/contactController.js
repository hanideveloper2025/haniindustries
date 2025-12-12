const { sendContactEmail } = require("../../utils/emailService");

// Handle Contact Form Submission
const submitContactForm = async (req, res) => {
  try {
    const { name, email, phone, organization, message } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        message:
          "Please fill all required fields (name, email, phone, message)",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // Validate phone (basic validation)
    const phoneRegex = /^[+]?[\d\s-]{10,}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid phone number",
      });
    }

    // Prepare contact data
    const contactData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      organization: organization ? organization.trim() : "",
      message: message.trim(),
      submittedAt: new Date().toISOString(),
    };

    // Send email to admin
    const emailResult = await sendContactEmail(contactData);

    if (!emailResult.success) {
      console.error("Failed to send contact email:", emailResult.error);
      return res.status(500).json({
        success: false,
        message: "Failed to send your message. Please try again later.",
      });
    }

    // Success response
    return res.status(200).json({
      success: true,
      message: "Thank you for contacting us! We will get back to you soon.",
    });
  } catch (error) {
    console.error("Contact form error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
};

module.exports = {
  submitContactForm,
};
