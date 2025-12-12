import { useState } from "react";
import "./Contact.css";

const TEST = import.meta.env.VITE_TEST;
const MAIN = import.meta.env.VITE_MAIN;

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organization: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: "", message: "" });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear status when user starts typing
    if (submitStatus.message) {
      setSubmitStatus({ type: "", message: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: "", message: "" });

    try {
      const response = await fetch(`${MAIN}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitStatus({
          type: "success",
          message:
            data.message ||
            "Thank you for contacting us! We will get back to you soon.",
        });
        // Reset form
        setFormData({
          name: "",
          email: "",
          organization: "",
          phone: "",
          message: "",
        });
      } else {
        setSubmitStatus({
          type: "error",
          message: data.message || "Failed to send message. Please try again.",
        });
      }
    } catch (error) {
      console.error("Contact form error:", error);
      setSubmitStatus({
        type: "error",
        message: "Something went wrong. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="contact">
      <div className="contact-container">
        <div className="contact-header">
          <h1>Contact Us</h1>
          <p>Get in touch with Hani Industries. We'd love to hear from you!</p>
        </div>

        <div className="contact-content">
          <div className="contact-info">
            <div className="info-item">
              <h3>Address</h3>
              <p>
                Hani Industries
                <br />
                Plot No:44, Vaishnavi nagar Thimmavaram
                <br />
                Chengalpattu 603101
              </p>
            </div>
            <div className="info-item">
              <h3>Phone</h3>
              <p>+91 93427 08080</p>
            </div>
            <div className="info-item">
              <h3>Email</h3>
              <p>haniidustries@gmail.com</p>
            </div>
          </div>

          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email ID *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email address"
              />
            </div>

            <div className="form-group">
              <label htmlFor="organization">Organization/Shop Name</label>
              <input
                type="text"
                id="organization"
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                placeholder="Enter your organization or shop name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="Enter your phone number"
              />
            </div>

            <div className="form-group">
              <label htmlFor="message">Message *</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                placeholder="Enter your message or inquiry..."
                rows="5"
              />
            </div>

            {submitStatus.message && (
              <div className={`submit-status ${submitStatus.type}`}>
                {submitStatus.type === "success" ? "✅" : "❌"}{" "}
                {submitStatus.message}
              </div>
            )}

            <button
              type="submit"
              className={`contact-submit-btn ${
                isSubmitting ? "submitting" : ""
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  Sending...
                </>
              ) : (
                "Send Message"
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default Contact;
