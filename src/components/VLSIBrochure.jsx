import React from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Download, Share2, Printer } from "lucide-react";
import brochureImage from "../assets/brochure.png"; // <-- replace with your actual image
import { motion } from "framer-motion"; // ✅ Correct import for JSX

export function VLSIBrochure({ className = "", isModal = false, onClose }) {
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = brochureImage;
    link.download = "Silicon-Craft-VLSI-Brochure.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Silicon Craft VLSI - Brochure",
          text: "Check out Silicon Craft VLSI Institute - Leading VLSI & Embedded Systems Training",
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <motion.div 
      className={`${className} ${isModal ? "fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" : ""}`}
      initial={isModal ? { opacity: 0 } : "hidden"}
      animate={isModal ? { opacity: 1 } : "visible"}
      variants={!isModal ? staggerContainer : undefined}
    >
      <Card className={`${isModal ? "max-w-4xl w-full max-h-[90vh] overflow-auto" : "w-full max-w-4xl mx-auto"} bg-white shadow-2xl`}>
        
        {/* Header Actions */}
        {isModal && (
          <div className="flex justify-between items-center p-4 border-b border-border">
            <h3 className="text-lg font-medium">Silicon Craft VLSI Brochure</h3>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print
              </Button>
              <Button
                variant
