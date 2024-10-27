import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import NavBar from '@/_components/nav/NavBar'
import {
  Sun,
  ArrowRight,
  Shield,
  Zap,
  Leaf,
  BarChart,
  ArrowUpRight,
  Play,
} from 'lucide-react'

const HomePage = () => {
  const [scrolled, setScrolled] = useState(false)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <NavBar
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'bg-background/80 backdrop-blur-lg shadow-sm' : 'bg-transparent'
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              className="max-w-2xl"
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.1 } }
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
                  The Future of
                  <br /> Energy is Here
                </span>
              </motion.h1>

              <motion.p 
                className="text-xl md:text-2xl text-muted-foreground mb-12 leading-relaxed"
                variants={heroVariants}
                custom={2}
              >
                Transform your energy consumption with cutting-edge solar technology. 
                Seamless integration, maximum efficiency.
              </motion.p>

              <motion.div 
                className="flex flex-col sm:flex-row gap-6"
                variants={heroVariants}
                custom={3}
              >
                <Button size="lg" className="group h-14 px-8 text-lg">
                  Start Your Journey
                  <ArrowUpRight className="ml-2 h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Button>
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
              Designed for Performance
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our solar panels combine cutting-edge technology with sleek design
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
                src="/api/placeholder/600/450"
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
                <h3 className="text-2xl font-semibold mb-4">Premium Materials</h3>
                <p className="text-lg text-muted-foreground">
                  Crafted from aerospace-grade materials for maximum durability and efficiency
                </p>
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-4">Smart Integration</h3>
                <p className="text-lg text-muted-foreground">
                  Seamlessly connects with your home&apos;s smart ecosystem
                </p>
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-4">25-Year Warranty</h3>
                <p className="text-lg text-muted-foreground">
                  Backed by our comprehensive protection plan
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
              { value: '5,000+', label: 'Installations', sublabel: 'Across the country', icon: <Sun className="h-8 w-8" /> },
              { value: '98%', label: 'Satisfaction', sublabel: 'Customer happiness', icon: <BarChart className="h-8 w-8" /> },
              { value: '30M+', label: 'kWh Generated', sublabel: 'Clean energy produced', icon: <Zap className="h-8 w-8" /> },
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
                      <div className="text-sm text-muted-foreground">{stat.sublabel}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section ref={featuresRef} className="py-32">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-6" variant="secondary">Features</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Intelligent Energy Solutions
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Advanced features designed to maximize your energy independence
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Sun className="h-10 w-10" />,
                title: 'Smart Solar',
                description: 'AI-powered panels that adapt to weather conditions',
                image: '/api/placeholder/400/300'
              },
              {
                icon: <Shield className="h-10 w-10" />,
                title: 'Energy Security',
                description: 'Backup power systems for uninterrupted supply',
                image: '/api/placeholder/400/300'
              },
              {
                icon: <Zap className="h-10 w-10" />,
                title: 'Real-time Monitoring',
                description: 'Track performance from your smartphone',
                image: '/api/placeholder/400/300'
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden group h-full hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-0">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={feature.image}
                        alt={feature.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-8">
                      <div className="mb-6 text-primary">{feature.icon}</div>
                      <h3 className="text-2xl font-semibold mb-4">{feature.title}</h3>
                      <p className="text-muted-foreground text-lg">
                        {feature.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        ref={ctaRef}
        className="py-32 relative overflow-hidden"
      >
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
                <Badge variant="secondary" className="mb-6">Limited Time Offer</Badge>
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
                      <p className="text-muted-foreground">Complete peace of mind with our comprehensive coverage</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Zap className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">$0 Down Payment</h3>
                      <p className="text-muted-foreground">Start saving immediately with our flexible financing options</p>
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
                      <p className="text-muted-foreground">Take advantage of federal incentives for going solar</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <BarChart className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Energy Independence</h3>
                      <p className="text-muted-foreground">Break free from rising utility costs</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <Button size="lg" className="group h-14 px-12 text-lg mb-4">
                  Get Your Free Quote
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
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
            <img
              src="/api/placeholder/1280/720"
              alt="Demo Video Placeholder"
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
    </div>
  )
}

export default HomePage