import React, { useState } from "react"
import "./FAQ.css"

export default function FAQ() {
  const [expandedIndex, setExpandedIndex] = useState(null)

  const faqs = [
    {
      question: "What products does Hani Industries offer?",
      answer: "Hani Industries specializes in a wide range of industrial products including oils, lubricants, chemical products, raw materials, and equipment. For a complete list, please visit our Collections and Products pages or contact us directly."
    },
    {
      question: "How can I place an order?",
      answer: "You can place an order by browsing our website, selecting your desired products, and adding them to your cart. Proceed to checkout, provide your delivery details, and choose your preferred payment method. You'll receive an order confirmation via email."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept multiple payment methods including Credit/Debit Cards, UPI, and Cash on Delivery (COD). All payments are processed through secure, authorized payment gateways."
    },
    {
      question: "How long does delivery take?",
      answer: "Delivery times vary based on location and product availability. Typically, orders are delivered within 5-7 business days. You will receive tracking information via email once your order is shipped."
    },
    {
      question: "Do you deliver outside Chengalpattu?",
      answer: "Yes, we deliver across India. Shipping costs and delivery timelines vary based on your location. You can check the delivery details at checkout."
    },
    {
      question: "Can I cancel my order?",
      answer: "Orders can be cancelled within 24 hours of purchase if they haven't been shipped yet. Once shipped, you cannot cancel but can initiate a return. Please refer to our Cancellation Policy for more details."
    },
    {
      question: "What is your refund policy?",
      answer: "Refunds are eligible for damaged, defective, or incorrectly described products returned within 7 days of delivery. The refund process typically takes 5-7 business days after approval. Please refer to our Refund and Cancellation Policy for complete details."
    },
    {
      question: "How do I return a product?",
      answer: "To return a product, contact us at haniindustries@gmail.com with your Order ID. Once approved, ship the product to our address (provided via email). We'll inspect it and process your refund or replacement accordingly."
    },
    {
      question: "What should I do if I receive a damaged product?",
      answer: "Report the damage within 24 hours of delivery with photos and your Order ID. Do not use the product. We will arrange free return shipping and provide a replacement or full refund at no cost."
    },
    {
      question: "Can I change my delivery address after placing an order?",
      answer: "Address changes are only possible before shipment. Contact us immediately if you need to change your address. Once shipped, you cannot redirect the order but can refuse delivery and request reshipping to a different address."
    },
    {
      question: "Do you offer bulk discounts?",
      answer: "Yes, we offer special pricing for bulk orders. Please contact our sales team at haniindustries@gmail.com or call +91 93427 08080 for a custom quote."
    },
    {
      question: "Are your products genuine and quality-assured?",
      answer: "Yes, all our products are sourced from trusted manufacturers and meet international quality standards. We ensure every product undergoes quality checks before shipping."
    },
    {
      question: "How can I contact customer support?",
      answer: "You can reach our customer support team via email at haniindustries@gmail.com or call +91 93427 08080 during business hours. You can also fill out the contact form on our Contact Us page."
    },
    {
      question: "Is my personal information secure?",
      answer: "Yes, we prioritize your privacy and security. Our website uses SSL encryption and PCI-DSS compliant payment gateways. We do not store sensitive payment information on our servers. Please refer to our Privacy Policy for more details."
    },
    {
      question: "Can I create an account on your website?",
      answer: "Yes, you can create an account on our website. Having an account allows you to track orders, save addresses, and manage your preferences. Account creation is free."
    },
    {
      question: "What should I do if I forgot my password?",
      answer: "Click the 'Forgot Password' link on the login page. Enter your registered email, and we'll send you a password reset link. Follow the instructions to create a new password."
    },
    {
      question: "Do you offer technical support for products?",
      answer: "Yes, our team can provide guidance on product selection and basic usage. For technical queries, please contact us at haniindustries@gmail.com with product details and your question."
    },
    {
      question: "What is your business location?",
      answer: "Hani Industries is located at Plot No: 44, Vaishnavi Nagar, Thimmavaram, Chengalpattu, Tamil Nadu 603101, India. You can view our location on Google Maps from our Contact page."
    },
    {
      question: "Do you offer wholesale or B2B services?",
      answer: "Yes, we cater to wholesale and B2B customers. For bulk orders, special pricing, and B2B inquiries, please contact our sales team at haniindustries@gmail.com or +91 93427 08080."
    },
    {
      question: "How often do you update your product inventory?",
      answer: "We regularly update our inventory to ensure availability of popular products. Stock availability varies by product. You can check real-time availability on our website or contact us for specific products."
    }
  ]

  const toggleFAQ = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index)
  }

  return (
    <div className="faq-container">
      <div className="faq-inner">
        <h1>Frequently Asked Questions</h1>
        <p className="faq-intro">
          Find answers to common questions about our products, services, ordering process, and more. 
          If you don't find your answer here, please feel free to <a href="/contact">contact us</a>.
        </p>

        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div key={index} className="faq-item">
              <button
                className="faq-question"
                onClick={() => toggleFAQ(index)}
                aria-expanded={expandedIndex === index}
              >
                <span className="faq-question-text">{faq.question}</span>
                <span className="faq-toggle-icon">
                  {expandedIndex === index ? "−" : "+"}
                </span>
              </button>
              {expandedIndex === index && (
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="faq-footer">
          <h2>Still Have Questions?</h2>
          <p>
            We're here to help! Contact us at:
          </p>
          <p>
            <strong>Email:</strong> <a href="mailto:haniindustries@gmail.com">haniindustries@gmail.com</a><br />
            <strong>Phone:</strong> +91 93427 08080<br />
            <strong>Address:</strong> Plot No: 44, Vaishnavi Nagar, Thimmavaram, Chengalpattu, Tamil Nadu 603101, India
          </p>
        </div>
      </div>
    </div>
  )
}
