'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import NavBar from '@/_components/nav/NavBar'
import {
  Sun,
  ArrowRight,
  ChevronRight,
  Shield,
  Zap,
  Leaf,
  BarChart,
} from 'lucide-react'

const HomePage = () => {
  const [scrolled, setScrolled] = useState(false)
  const heroRef = useRef(null)
  const statsRef = useRef(null)
  const featuresRef = useRef(null)
  const ctaRef = useRef(null)

  const { scrollYProgress } = useScroll()
  const yPosAnim = useSpring(useTransform(scrollYProgress, [0, 1], [0, -50]))

  const statsInView = useInView(statsRef, { once: true, amount: 0.3 })
  const featuresInView = useInView(featuresRef, { once: true, amount: 0.3 })

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const heroVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' }
    })
  }

  const statVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } }
  }

  const featureVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' }
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <NavBar
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-background/80 backdrop-blur-lg shadow-sm' : 'bg-transparent'
        }`}
      />

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
      >
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-primary/10 to-background/95" />
          <motion.div
            className="absolute inset-0"
            style={{
              backgroundImage: 'url("/grid-pattern.svg")',
              backgroundSize: '30px 30px',
              y: yPosAnim,
            }}
          />
        </div>

        <div className="relative z-10 container mx-auto px-4">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1 } }
            }}
          >
            <motion.div variants={heroVariants} custom={0}>
              <Badge className="mb-6 py-2 px-4 text-sm" variant="secondary">
                Transforming Energy Solutions
              </Badge>
            </motion.div>

            <motion.h1 
              className="text-5xl md:text-7xl font-bold mb-8 leading-tight"
              variants={heroVariants}
              custom={1}
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary/60">
                Power Your Future with
                <br /> Sustainable Energy
              </span>
            </motion.h1>

            <motion.p 
              className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed"
              variants={heroVariants}
              custom={2}
            >
              Join the revolution in renewable energy. Experience seamless transition to clean energy with our expert solutions.
            </motion.p>

            <motion.div 
              className="flex flex-col sm:flex-row gap-6 justify-center mb-16"
              variants={heroVariants}
              custom={3}
            >
              <Button size="lg" className="group h-14 px-8 text-lg">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" className="group h-14 px-8 text-lg">
                Learn More
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronRight className="h-8 w-8 text-primary rotate-90" />
        </motion.div>
      </section>

      {/* Stats Section */}
      <section
        ref={statsRef}
        className="py-32 bg-gradient-to-b from-secondary/5 to-background"
      >
        <div className="container mx-auto px-4">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-12"
            initial="hidden"
            animate={statsInView ? "visible" : "hidden"}
            variants={{
              visible: { transition: { staggerChildren: 0.1 } }
            }}
          >
            {[
              { value: 5000, label: 'Happy Customers', icon: <Leaf className="h-8 w-8" /> },
              { value: 98, label: 'Customer Satisfaction %', icon: <BarChart className="h-8 w-8" /> },
              { value: 1500, label: 'Solar Installations', icon: <Sun className="h-8 w-8" /> },
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="text-center relative group"
                variants={statVariants}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="absolute inset-0 bg-primary/5 rounded-2xl blur-3xl group-hover:blur-2xl transition-all duration-300" />
                <div className="relative p-8 bg-background/50 backdrop-blur-sm rounded-xl shadow-lg">
                  <div className="text-primary mb-4 flex justify-center">{stat.icon}</div>
                  <motion.h3 
                    className="text-5xl font-bold text-primary mb-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                    >
                      {stat.value.toLocaleString()}
                    </motion.span>
                  </motion.h3>
                  <p className="text-lg text-muted-foreground">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-32">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-24">
            Why Choose EcoSync?
          </h2>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            initial="hidden"
            animate={featuresInView ? "visible" : "hidden"}
            variants={{
              visible: { transition: { staggerChildren: 0.1 } }
            }}
          >
            {[
              {
                icon: <Sun className="h-10 w-10" />,
                title: 'Solar Solutions',
                description: 'Custom-tailored solar panel solutions for your specific needs and location.',
              },
              {
                icon: <Shield className="h-10 w-10" />,
                title: 'Certified Experts',
                description: 'Network of vetted and certified installation professionals.',
              },
              {
                icon: <Zap className="h-10 w-10" />,
                title: 'Smart Savings',
                description: 'Advanced calculation tools to maximize your energy savings.',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={featureVariants}
                custom={index}
                whileHover={{ y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="relative overflow-hidden group h-full">
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
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        ref={ctaRef}
        className="py-32 relative overflow-hidden bg-[url('/loginhero.svg')] bg-cover bg-center"
      >
        <div className="absolute inset-0 bg-primary/80 backdrop-blur-sm" />
        <motion.div
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0)_0%,rgba(0,0,0,0.3)_100%)]"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center text-white">
            <motion.h2 
              className="text-4xl md:text-5xl font-bold mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              Ready to Make the Switch?
            </motion.h2>
            <motion.p 
              className="text-xl mb-12 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              Join thousands of homeowners who have already embraced clean energy.
              Get your free solar assessment today.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Button size="lg" className="group h-14 px-8 text-lg bg-white text-primary hover:bg-white/90">
                Get Your Free Assessment
                <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage