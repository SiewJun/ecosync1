import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import NavBar from '@/_components/nav/NavBar';
import {
  Sun,
  ArrowRight,
  ChevronRight,
  Shield,
  Zap,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const HomePage = () => {
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef(null);
  const statsRef = useRef(null);
  const featuresRef = useRef(null);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Hero stagger animation
    const heroElements = heroRef.current.querySelectorAll('.animate-hero');
    gsap.fromTo(
      heroElements,
      {
        opacity: 0,
        y: 50
      },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.2,
        ease: 'power3.out'
      }
    );

    // Parallax background effect
    gsap.to('.parallax-bg', {
      scrollTrigger: {
        trigger: heroRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: 1
      },
      y: 200,
      ease: 'none'
    });

    // Stats counter with improved animation
    const stats = statsRef.current.querySelectorAll('.stat-number');
    stats.forEach(stat => {
      const value = parseInt(stat.dataset.value);
      gsap.to(stat, {
        scrollTrigger: {
          trigger: stat,
          start: 'top center+=100',
          toggleActions: 'play none none reverse'
        },
        duration: 2,
        ease: 'power2.out',
        innerText: value,
        snap: { innerText: 1 },
        onUpdate: () => {
          stat.innerHTML = stat.innerHTML.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }
      });
    });

    // Features cards stagger animation
    const features = featuresRef.current.querySelectorAll('.feature-card');
    features.forEach((feature, index) => {
      gsap.fromTo(
        feature,
        {
          opacity: 0,
          y: 50
        },
        {
          scrollTrigger: {
            trigger: feature,
            start: 'top center+=100',
            toggleActions: 'play none none reverse'
          },
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: index * 0.2,
          ease: 'power2.out'
        }
      );
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <NavBar className={`transition-all duration-300 ${scrolled ? 'bg-background/80 backdrop-blur-lg shadow-sm' : 'bg-transparent'}`} />
      
      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Gradient Background */}
        <div className="parallax-bg absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-primary/10 to-background" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0)_0%,rgba(0,0,0,0.2)_100%)]" />
        </div>

        {/* Floating Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-primary/5"
              style={{
                width: Math.random() * 300 + 100,
                height: Math.random() * 300 + 100,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 container mx-auto px-4">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            initial={false}
          >
            <Badge className="animate-hero mb-6 py-2 px-4 text-sm" variant="secondary">
              Transforming Energy Solutions
            </Badge>
            
            <h1 className="animate-hero text-5xl md:text-7xl font-bold mb-8 leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary/60">
                Power Your Future with
                <br /> Sustainable Energy
              </span>
            </h1>
            
            <p className="animate-hero text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
              Join the revolution in renewable energy. Experience seamless transition to clean energy with our expert solutions.
            </p>
            
            <div className="animate-hero flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Button size="lg" className="group h-14 px-8 text-lg">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" className="group h-14 px-8 text-lg">
                Learn More
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section 
        ref={statsRef}
        className="py-32 bg-gradient-to-b from-secondary/5 to-background"
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { value: 5000, label: "Happy Customers" },
              { value: 98, label: "Customer Satisfaction %" },
              { value: 1500, label: "Solar Installations" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="text-center relative group"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="absolute inset-0 bg-primary/5 rounded-2xl blur-3xl group-hover:blur-2xl transition-all duration-300" />
                <div className="relative">
                  <h3 className="stat-number text-5xl font-bold text-primary mb-4" data-value={stat.value}>
                    0
                  </h3>
                  <p className="text-lg text-muted-foreground">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section 
        ref={featuresRef}
        className="py-32"
      >
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-24">
            Why Choose EcoSync?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Sun className="h-10 w-10" />,
                title: "Solar Solutions",
                description: "Custom-tailored solar panel solutions for your specific needs and location."
              },
              {
                icon: <Shield className="h-10 w-10" />,
                title: "Certified Experts",
                description: "Network of vetted and certified installation professionals."
              },
              {
                icon: <Zap className="h-10 w-10" />,
                title: "Smart Savings",
                description: "Advanced calculation tools to maximize your energy savings."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="feature-card relative overflow-hidden group h-full">
                  <CardContent className="p-8">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/0 via-primary to-primary/0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                    <div className="mb-6 text-primary group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <h3 className="text-2xl font-semibold mb-4">{feature.title}</h3>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5" />
        <motion.div
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0)_0%,rgba(0,0,0,0.1)_100%)]"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-8">
              Ready to Make the Switch?
            </h2>
            <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
              Join thousands of homeowners who have already embraced clean energy. 
              Get your free solar assessment today.
            </p>
            <Button size="lg" className="group h-14 px-8 text-lg">
              Get Your Free Assessment
              <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;