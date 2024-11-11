import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
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
  Calculator,
  FileText,
  Handshake,
  CheckCircle,
  Sparkles,
} from "lucide-react";
import Lottie from "lottie-react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

// Import the animation data
import calculatorAnimation from "../animations/calculatorAnimation.json";
import quoteAnimation from "../animations/quoteAnimation.json";
import planningAnimation from "../animations/planningAnimation.json";
import installationAnimation from "../animations/installationAnimation.json";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center py-24">
      {/* Background Image with Parallax Effect */}
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ scale: 0.99 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-background" />
        <img
          src="/hero.jpg"
          alt="Solar Energy Background"
          className="w-full h-full object-cover object-center"
        />
      </motion.div>

      {/* Animated Grid Overlay */}
      <div className="absolute inset-0 z-10">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "4rem 4rem",
            mask: "linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)",
          }}
        />
      </div>

      {/* 3D Floating Elements */}
      <div className="absolute inset-0 z-20 overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full"
          style={{
            background:
              "linear-gradient(45deg, rgba(0,255,255,0.1), rgba(0,255,255,0))",
            filter: "blur(60px)",
          }}
          animate={{
            y: [0, 50, 0],
            rotate: [0, 360],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full"
          style={{
            background:
              "linear-gradient(45deg, rgba(0,255,255,0), rgba(0,255,255,0.1))",
            filter: "blur(80px)",
          }}
          animate={{
            y: [50, 0, 50],
            rotate: [360, 0],
            scale: [1.2, 1, 1.2],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 relative z-30">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <Badge
              className="mb-8 py-2 px-4 bg-background backdrop-blur-lg border-white/20"
              variant="secondary"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Future of Clean Energy
            </Badge>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center mb-12"
          >
            <h1 className="text-7xl md:text-8xl font-bold mb-8 tracking-tight text-white">
              <span className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400/60">
                Empower
              </span>
              <br />
              <span className="relative inline-block">
                Your Solar Future
                <motion.div
                  className="absolute -bottom-2 left-0 w-full h-1"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(0,255,255,0.5), transparent)",
                  }}
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "100%", opacity: 1 }}
                  transition={{ duration: 1.5, delay: 1 }}
                />
              </span>
            </h1>
          </motion.div>

          <motion.p
            className="text-xl md:text-2xl text-white/80 mb-16 text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Discover sustainable solar solutions tailored to you, with trusted
            installers ready to power your green energy journey.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-8 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="flex justify-center items-center">
              <Link to="/solar-estimation">
                <Button
                  size="lg"
                  className="group h-16 px-10 text-lg relative overflow-hidden bg-foreground/10 backdrop-blur-lg hover:bg-foreground/20 border-foreground/20"
                >
                  <span className="relative z-10 flex items-center text-foreground">
                    Get Started
                    <ArrowUpRight className="ml-3 h-6 w-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </span>
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent z-40" />
    </section>
  );
};

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
      <div className="h-56 mb-8 relative rounded-xl overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
        <div className="text-primary transform group-hover:scale-110 transition-transform duration-500">
          {step.icon}
        </div>
      </div>
    );
  }

  return (
    <div className="h-56 mb-8 relative bg-primary/5 rounded-xl overflow-hidden">
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
      <HeroSection />

      {/* Product Showcase */}
      <section className="py-52 overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-24"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-8">
              Trustworthy Solar Solutions
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              High-quality, reliable solar installations using premium
              materials, smart home integration, and pre-screened partners for
              safety and trust.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
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
              className="space-y-12"
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
        className="py-40 bg-gradient-to-b from-secondary/5 to-background"
      >
        <div className="container mx-auto px-4">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-16"
            initial={{ opacity: 0, y: 20 }}
            animate={statsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            {[
              {
                value: "3,000+",
                label: "Installations",
                sublabel: "Across the country",
                icon: <Sun className="h-10 w-10" />,
              },
              {
                value: "98%",
                label: "Satisfaction",
                sublabel: "Customer happiness",
                icon: <BarChart className="h-10 w-10" />,
              },
              {
                value: "10M+",
                label: "kWh Generated",
                sublabel: "Clean energy produced",
                icon: <Zap className="h-10 w-10" />,
              },
            ].map((stat, index) => (
              <Card key={index} className="relative overflow-hidden group">
                <CardContent className="p-10">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                  />
                  <div className="relative space-y-6">
                    <div className="text-primary">{stat.icon}</div>
                    <h3 className="text-5xl font-bold">{stat.value}</h3>
                    <div>
                      <div className="text-2xl font-semibold">{stat.label}</div>
                      <div className="text-lg text-muted-foreground">
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
      <section ref={featuresRef} className="py-40 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/5 via-background to-background" />

        <div className="container mx-auto px-4 relative">
          <motion.div
            className="text-center mb-24"
            initial={{ opacity: 0, y: 20 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <Badge className="mb-8" variant="secondary">
              Simple Process
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-8">
              Your Journey to Solar Power
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Four simple steps to transform your home into a clean energy
              powerhouse
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative">
            {/* Connected Line Background */}
            <div className="absolute hidden lg:block top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20 transform -translate-y-1/2" />

            {[
              {
                step: "01",
                stepId: "calculator",
                icon: <Calculator className="h-14 w-14" />,
                title: "Estimate Savings",
                description:
                  "Get an instant calculation of your potential monthly savings based on roof area and average monthly electricity bill",
                highlight: "Average savings of RM150/month",
              },
              {
                step: "02",
                stepId: "quote",
                icon: <FileText className="h-14 w-14" />,
                title: "Request Quote",
                description:
                  "Receive a detailed quotation tailored to your home's specific requirements and energy needs",
                highlight: "Free consultation included",
              },
              {
                step: "03",
                stepId: "planning",
                icon: <Handshake className="h-14 w-14" />,
                title: "Project Planning",
                description:
                  "Our experts design your custom solar solution and handle all permits and paperwork",
                highlight: "Hassle-free experience",
              },
              {
                step: "04",
                stepId: "installation",
                icon: <CheckCircle className="h-14 w-14" />,
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
                <div className="absolute -top-6 -left-6 bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center font-bold text-primary text-xl">
                  {step.step}
                </div>

                <Card className="group h-full hover:shadow-xl transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-background to-secondary/5">
                  <CardContent className="p-8">
                    {/* Animation Container with step-specific animation */}
                    <AnimationContainer step={step} stepId={step.stepId} />

                    <div className="space-y-6">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-primary/10 rounded-lg text-primary">
                          {step.icon}
                        </div>
                        <h3 className="text-2xl font-semibold">{step.title}</h3>
                      </div>

                      <p className="text-muted-foreground text-lg leading-relaxed">
                        {step.description}
                      </p>

                      <div className="bg-primary/5 rounded-lg p-4 text-sm font-medium text-primary">
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
            className="mt-24 text-center"
          >
            <Link to="/solar-estimation">
              <Button size="lg" className="group h-16 px-10 text-lg">
                Start Your Solar Journey
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="py-40 relative overflow-hidden">
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
              className="bg-background/70 backdrop-blur-lg rounded-3xl p-16 md:p-20"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="text-center mb-16">
                <Badge variant="secondary" className="mb-8">
                  Limited Time Offer
                </Badge>
                <h2 className="text-4xl md:text-5xl font-bold mb-8">
                  Start Your Solar Journey Today
                </h2>
                <p className="text-xl text-muted-foreground">
                  Get a personalized quote and see how much you could save
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
                <div className="space-y-8">
                  <div className="flex items-start gap-6">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <Shield className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-3">
                        25-Year Warranty
                      </h3>
                      <p className="text-muted-foreground">
                        Complete peace of mind with our comprehensive coverage
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-6">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <Zap className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-3">
                        $0 Down Payment
                      </h3>
                      <p className="text-muted-foreground">
                        Start saving immediately with our flexible financing
                        options
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="flex items-start gap-6">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <Leaf className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-3">
                        30% Tax Credit
                      </h3>
                      <p className="text-muted-foreground">
                        Take advantage of federal incentives for going solar
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-6">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <BarChart className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-3">
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
                  <Button size="lg" className="group h-16 px-12 text-lg mb-6">
                    Get Your Free Quote
                    <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
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
