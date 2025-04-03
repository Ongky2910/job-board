import { useState } from "react";
import { motion } from "framer-motion";
import {
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaLinkedin,
  FaGithub,
} from "react-icons/fa";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Handle change for form fields
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    if (!form.name) newErrors.name = "Name is required";
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "Please enter a valid email";
    if (!form.message) newErrors.message = "Message is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        setSuccess(true);
        alert("Message sent successfully!");
      }, 1500);
    } else {
      alert("Please fill out all fields correctly.");
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center p-8 space-y-6 min-h-screen">
  {/* Digital Business Card */}
  <motion.div
    whileHover={{ scale: 1.05 }}
    transition={{ duration: 0.3 }}
    className="bg-gradient-to-r from-blue-400 to-purple-500 w-full h-full absolute top-0 left-0 z-0"
  ></motion.div>

  {/* Card */}
  <Card className="p-4 shadow-lg bg-white rounded-2xl z-10 relative">
    <CardContent className="flex flex-col items-center space-y-2">
      <h2 className="text-xl font-bold dark:text-gray-900">Ongky Permana</h2>
      <p className="text-gray-500">Full-Stack Developer</p>
      <div className="flex space-x-4 dark:text-gray-900 text-lg">
        <a href="tel:+81343607827" className="hover:text-green-500"><FaPhone /></a>
        <a href="mailto:ongkypermana21@gmail.com" className="hover:text-red-500"><FaEnvelope /></a>
        <a href="#" className="hover:text-blue-500"><FaMapMarkerAlt /></a>
        <a href="https://www.linkedin.com/in/ongky-permana-882099315/" className="hover:text-blue-500"><FaLinkedin /></a>
        <a href="https://github.com/Ongky2910" className="hover:text-blue-500"><FaGithub /></a>
      </div>
    </CardContent>
  </Card>

  {/* Contact Form */}
  <motion.form
    whileHover={{ scale: 1.02 }}
    onSubmit={handleSubmit}
    className="w-full max-w-md bg-white p-6 shadow-lg rounded-2xl z-10 relative mt-6"
  >
    <h3 className="text-lg font-semibold mb-4 dark:text-gray-900">Get in Touch</h3>
    <Input
      name="name"
      placeholder="Your Name"
      value={form.name}
      onChange={handleChange}
      className="mb-3"
      required
      aria-label="Your Name"
    />
    {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
    <Input
      name="email"
      type="email"
      placeholder="Your Email"
      value={form.email}
      onChange={handleChange}
      className="mb-3"
      required
      aria-label="Your Email"
    />
    {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
    <Textarea
      name="message"
      placeholder="Your Message"
      value={form.message}
      onChange={handleChange}
      className="mb-3"
      required
      aria-label="Your Message"
    />
    {errors.message && <p className="text-red-500 text-sm">{errors.message}</p>}
    <Button
      type="submit"
      className="w-full transition-all duration-200 ease-in-out hover:bg-green-500 hover:text-white"
    >
      {isSubmitting ? "Sending..." : "Send Message"}
    </Button>
  </motion.form>
</div>
  );
}
