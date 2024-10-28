import { useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
} from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import NavBar from "@/_components/nav/NavBar";
import {
  Sun,
  ArrowRight,
  Shield,
  Zap,
  Leaf,
  BarChart,
  ArrowUpRight,
  Play,
  Mail,
  Calculator,
  FileText,
  Handshake,
  CheckCircle,
} from "lucide-react";
import EcoSyncLogo from "@/_components/nav/EcoSyncLogo";
import Lottie from "lottie-react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

// Import the animation data
import calculatorAnimation from "../animations/calculatorAnimation.json";
import quoteAnimation from "../animations/quoteAnimation.json";
import planningAnimation from "../animations/planningAnimation.json";
import installationAnimation from "../animations/installationAnimation.json";

// Component for step-specific animation or fallback
const AnimationContainer = ({ step, stepId }) => {
  const [animationErrors, setAnimationErrors] = useState({
    calculator: false,
    quote: false,
    planning: false,
    installation: false,
  });

  const stepAnimations = {
    calculator: calculatorAnimation,
    quote: quoteAnimation,
    planning: planningAnimation,
    installation: installationAnimation,
  };

  const handleAnimationError = (stepId) => {
    setAnimationErrors((prev) => ({
      ...prev,
      [stepId]: true,
    }));
  };

  if (animationErrors[stepId]) {
    return (
      <div className="h-48 mb-6 relative rounded-xl overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
        <div className="text-primary transform group-hover:scale-110 transition-transform duration-500">
          {step.icon}
        </div>
      </div>
    );
  }

  return (
    <div className="h-48 mb-6 relative bg-primary/5 rounded-xl overflow-hidden">
      <Lottie
        animationData={stepAnimations[stepId]}
        loop={true}
        className="w-full h-full"
        onError={() => handleAnimationError(stepId)}
        rendererSettings={{
          preserveAspectRatio: "xMidYMid slice",
        }}
      />
    </div>
  );
};

const HomePage = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const heroRef = useRef(null);
  const statsRef = useRef(null);
  const featuresRef = useRef(null);
  const ctaRef = useRef(null);

  const statsInView = useInView(statsRef, { once: true, amount: 0.3 });
  const featuresInView = useInView(featuresRef, { once: true, amount: 0.3 });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const heroVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
    }),
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <NavBar
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-background/80 backdrop-blur-lg shadow-sm"
            : "bg-transparent"
        }`}
      />

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center pt-20"
      >
        {/* Hero Background */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-primary/5 via-primary/10 to-background/95"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          />
        </div>

        <div className="relative z-10 container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              className="max-w-2xl"
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.1 } },
              }}
            >
              <motion.div variants={heroVariants} custom={0}>
                <Badge className="mb-6 py-2 px-4 text-sm" variant="secondary">
                  Redefining Clean Energy
                </Badge>
              </motion.div>

              <motion.h1
                className="text-5xl md:text-7xl font-bold mb-8 leading-tight tracking-tight"
                variants={heroVariants}
                custom={1}
              >
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary/60">
                  Empowering Your
                  <br /> Green Energy Journey
                </span>
              </motion.h1>

              <motion.p
                className="text-xl md:text-2xl text-muted-foreground mb-12 leading-relaxed"
                variants={heroVariants}
                custom={2}
              >
                Discover top solar providers within Malaysia, compare custom
                quotes, and start your path to a sustainable future.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-6"
                variants={heroVariants}
                custom={3}
              >
                <Link to="/solar-estimation">
                  <Button size="lg" className="group h-14 px-8 text-lg">
                    Start Your Journey
                    <ArrowUpRight className="ml-2 h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </Button>
                </Link>

                <Button
                  size="lg"
                  variant="outline"
                  className="group h-14 px-8 text-lg"
                  onClick={() => setIsVideoPlaying(true)}
                >
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </Button>
              </motion.div>
            </motion.div>

            <motion.div
              className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <img
                src="/hero.jpg"
                alt="Solar Installation"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Product Showcase */}
      <section className="py-32 overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Trustworthy Solar Solutions
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              High-quality, reliable solar installations using premium
              materials, smart home integration, and pre-screened partners for
              safety and trust.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <motion.div
              className="relative aspect-[4/3] rounded-3xl overflow-hidden"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <img
                src="/solar-design.jpg"
                alt="Solar Panel Design"
                className="w-full h-full object-cover"
              />
            </motion.div>
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div>
                <h3 className="text-2xl font-semibold mb-4">
                  Premium Materials
                </h3>
                <p className="text-lg text-muted-foreground">
                  Aerospace-grade materials for top durability and efficiency
                </p>
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-4">
                  Smart Home Integration
                </h3>
                <p className="text-lg text-muted-foreground">
                  Easily connects with your home&apos;s smart devices
                </p>
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-4">
                  Verified Partners
                </h3>
                <p className="text-lg text-muted-foreground">
                  Our platform pre-screens installers for safe and reliable
                  solar solutions
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section
        ref={statsRef}
        className="py-32 bg-gradient-to-b from-secondary/5 to-background"
      >
        <div className="container mx-auto px-4">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-12"
            initial={{ opacity: 0, y: 20 }}
            animate={statsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            {[
              {
                value: "3,000+",
                label: "Installations",
                sublabel: "Across the country",
                icon: <Sun className="h-8 w-8" />,
              },
              {
                value: "98%",
                label: "Satisfaction",
                sublabel: "Customer happiness",
                icon: <BarChart className="h-8 w-8" />,
              },
              {
                value: "10M+",
                label: "kWh Generated",
                sublabel: "Clean energy produced",
                icon: <Zap className="h-8 w-8" />,
              },
            ].map((stat, index) => (
              <Card key={index} className="relative overflow-hidden group">
                <CardContent className="p-8">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                  />
                  <div className="relative space-y-4">
                    <div className="text-primary">{stat.icon}</div>
                    <h3 className="text-4xl font-bold">{stat.value}</h3>
                    <div>
                      <div className="text-xl font-semibold">{stat.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {stat.sublabel}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Solar Journey Steps */}
      <section ref={featuresRef} className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/5 via-background to-background" />

        <div className="container mx-auto px-4 relative">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <Badge className="mb-6" variant="secondary">
              Simple Process
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Your Journey to Solar Power
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Four simple steps to transform your home into a clean energy
              powerhouse
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Connected Line Background */}
            <div className="absolute hidden lg:block top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20 transform -translate-y-1/2" />

            {[
              {
                step: "01",
                stepId: "calculator",
                icon: <Calculator className="h-12 w-12" />,
                title: "Estimate Savings",
                description:
                  "Get an instant calculation of your potential monthly savings based on roof area and average monthly electricity bill",
                highlight: "Average savings of RM150/month",
              },
              {
                step: "02",
                stepId: "quote",
                icon: <FileText className="h-12 w-12" />,
                title: "Request Quote",
                description:
                  "Receive a detailed quotation tailored to your home's specific requirements and energy needs",
                highlight: "Free consultation included",
              },
              {
                step: "03",
                stepId: "planning",
                icon: <Handshake className="h-12 w-12" />,
                title: "Project Planning",
                description:
                  "Our experts design your custom solar solution and handle all permits and paperwork",
                highlight: "Hassle-free experience",
              },
              {
                step: "04",
                stepId: "installation",
                icon: <CheckCircle className="h-12 w-12" />,
                title: "Installation",
                description:
                  "Professional installation by certified technicians, followed by system activation",
                highlight: "1-2 days installation",
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.2 }}
                className="relative"
              >
                {/* Step Number */}
                <div className="absolute -top-4 -left-4 bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center font-bold text-primary text-lg">
                  {step.step}
                </div>

                <Card className="group h-full hover:shadow-xl transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-background to-secondary/5">
                  <CardContent className="p-6">
                    {/* Animation Container with step-specific animation */}
                    <AnimationContainer step={step} stepId={step.stepId} />

                    <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                          {step.icon}
                        </div>
                        <h3 className="text-2xl font-semibold">{step.title}</h3>
                      </div>

                      <p className="text-muted-foreground text-lg leading-relaxed">
                        {step.description}
                      </p>

                      <div className="bg-primary/5 rounded-lg p-3 text-sm font-medium text-primary">
                        {step.highlight}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.8 }}
            className="mt-16 text-center"
          >
            <Link to="/solar-estimation">
              <Button size="lg" className="group h-14 px-8 text-lg">
                Start Your Solar Journey
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="py-32 relative overflow-hidden">
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <img
            src="/cta.jpg"
            alt="Solar Installation"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70 mix-blend-multiply" />
        </motion.div>

        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto">
            <motion.div
              className="bg-background/95 backdrop-blur-lg rounded-3xl p-12 md:p-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="text-center mb-12">
                <Badge variant="secondary" className="mb-6">
                  Limited Time Offer
                </Badge>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Start Your Solar Journey Today
                </h2>
                <p className="text-xl text-muted-foreground">
                  Get a personalized quote and see how much you could save
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">25-Year Warranty</h3>
                      <p className="text-muted-foreground">
                        Complete peace of mind with our comprehensive coverage
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Zap className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">$0 Down Payment</h3>
                      <p className="text-muted-foreground">
                        Start saving immediately with our flexible financing
                        options
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Leaf className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">30% Tax Credit</h3>
                      <p className="text-muted-foreground">
                        Take advantage of federal incentives for going solar
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <BarChart className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">
                        Energy Independence
                      </h3>
                      <p className="text-muted-foreground">
                        Break free from rising utility costs
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <Link to="solar-estimation">
                  <Button size="lg" className="group h-14 px-12 text-lg mb-4">
                    Get Your Free Quote
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <p className="text-sm text-muted-foreground">
                  No commitment required. Free consultation.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Video Modal */}
      {isVideoPlaying && (
        <motion.div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-full max-w-4xl aspect-video bg-secondary rounded-2xl overflow-hidden"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
          >
            <video
              src="/demo.mp4"
              controls
              autoPlay
              className="w-full h-full object-cover"
            />
            <Button
              variant="ghost"
              className="absolute top-4 right-4"
              onClick={() => setIsVideoPlaying(false)}
            >
              Close
            </Button>
          </motion.div>
        </motion.div>
      )}

      {/* Futuristic Footer */}
      <footer className="relative overflow-hidden bg-gradient-to-b from-background to-background/95 pt-24 pb-12">
        <div className="absolute inset-0">
          <motion.div
            className="absolute inset-0"
            style={{
              backgroundImage: 'url("/grid-pattern.jpg")',
              backgroundSize: "30px 30px",
              opacity: 0.1,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/95 to-transparent" />
        </div>

        <div className="container mx-auto px-4 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <EcoSyncLogo />
              </div>
              <p className="text-muted-foreground">
                Empowering Your Green Energy Journey
              </p>
              <div className="flex gap-4"></div>
            </div>
            <div className="space-y-6">
              <h4 className="text-lg font-semibold">Services</h4>
              <ul className="space-y-4">
                {[
                  { name: "Get Estimate", link: "/solar-estimation" },
                  { name: "Search Solar Installers", link: "/installers" },
                  { name: "Explore Solar Solutions", link: "/solar-solutions" },
                ].map((item, index) => (
                  <li key={index}>
                    <Link to={item.link}>
                      <Button
                        variant="link"
                        className="p-0 h-auto text-muted-foreground hover:text-primary"
                      >
                        {item.name}
                      </Button>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-lg font-semibold">Information</h4>
              <ul className="space-y-4">
                {[
                  { name: "About", link: "/about" },
                  { name: "Incentives", link: "/incentives" },
                  { name: "Sustainability", link: "/sustainability" },
                ].map((item, index) => (
                  <li key={index}>
                    <Link to={item.link}>
                      <Button
                        variant="link"
                        className="p-0 h-auto text-muted-foreground hover:text-primary"
                      >
                        {item.name}
                      </Button>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-lg font-semibold">Contact</h4>
              <div className="space-y-4">
                <Button className="w-full group" variant="outline">
                  <Mail className="mr-2 h-4 w-4" />
                  Contact Sales
                  <ArrowUpRight className="ml-2 h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Button>
                <p className="text-sm text-muted-foreground">
                  Monday - Friday, 9am - 5pm EST
                </p>
                <p className="text-sm text-muted-foreground">
                  support@ecosync.com
                </p>
              </div>
            </div>
          </div>

          <motion.div
            className="pt-8 mt-8 border-t border-border"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex flex-col md:flex-row justify-end items-center gap-4">
              <p className="text-sm text-muted-foreground">
                © 2024 EcoSync. All rights reserved.
              </p>
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  );
};

AnimationContainer.propTypes = {
  step: PropTypes.shape({
    icon: PropTypes.node.isRequired,
  }).isRequired,
  stepId: PropTypes.string.isRequired,
};

export default HomePage;
