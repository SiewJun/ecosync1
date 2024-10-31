import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import NavBar from "@/_components/nav/NavBar";
import { Building2, Sun, Leaf, Shield } from "lucide-react";

const AboutPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const features = [
    {
      icon: Building2,
      title: "Our Mission",
      description:
        "At EcoSync, our mission is to create a seamless marketplace for green energy solutions. We verify the legitimacy of companies and provide consumers with a platform to view available companies, get quotations, and turn them into projects—all in one place.",
    },
    {
      icon: Sun,
      title: "Our Vision",
      description:
        "Our vision is to lead the renewable energy industry by offering a trusted platform where consumers can easily connect with verified green energy companies, obtain quotations, and manage their projects efficiently.",
    },
    {
      icon: Leaf,
      title: "Sustainability",
      description:
        "Sustainability is at the core of everything we do. We are dedicated to promoting eco-friendly practices and helping our customers transition to renewable energy sources through a reliable and transparent marketplace.",
    },
    {
      icon: Shield,
      title: "Quality Assurance",
      description:
        "We are committed to delivering the highest quality products and services. Our platform ensures that all listed companies are verified, providing consumers with peace of mind and confidence in their green energy investments.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background">
      <NavBar />
      <section className="py-32">
        <div className="container px-4 mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-24"
          >
            <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              About EcoSync
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Your Trusted Green Energy Solutions Marketplace
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={cardVariants}>
                <Card className="group h-full hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                  <CardContent className="p-8 md:p-10">
                    <div className="flex items-center gap-6 mb-8">
                      <div className="p-4 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                        <feature.icon className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-2xl font-semibold tracking-tight">
                        {feature.title}
                      </h3>
                    </div>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="text-center mt-24"
          >
            <Link to="/solar-estimation">
              <Button
                size="lg"
                className="group h-16 px-12 text-lg rounded-2xl hover:scale-105 transition-transform duration-300"
              >
                Get Started
                <motion.span
                  className="ml-2"
                  animate={{ x: [0, 4, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  →
                </motion.span>
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
