import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, CheckCircle, Shield, Clock, TrendingUp, 
  FileText, Zap, Award 
} from 'lucide-react';
import { pageVariants, cardVariants, staggerContainer, buttonVariants } from '../animations/variants';

const Home = () => {
  const features = [
    {
      icon: Zap,
      title: 'Instant Approval',
      description: 'Get loan decisions in minutes, not days'
    },
    {
      icon: Shield,
      title: 'Secure & Trusted',
      description: 'Bank-grade security for your data'
    },
    {
      icon: Clock,
      title: '24/7 Processing',
      description: 'Apply anytime, anywhere'
    },
    {
      icon: TrendingUp,
      title: 'Competitive Rates',
      description: 'Best interest rates in the market'
    }
  ];

  const steps = [
    {
      number: '01',
      title: 'Choose Loan Type',
      description: 'Select from 8 different loan options'
    },
    {
      number: '02',
      title: 'Check Eligibility',
      description: 'Instant eligibility check with EMI calculator'
    },
    {
      number: '03',
      title: 'Upload Documents',
      description: 'Simple digital document submission'
    },
    {
      number: '04',
      title: 'Get Approved',
      description: 'Fast approval and disbursal'
    }
  ];

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen"
    >
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primaryDark to-secondary text-white overflow-hidden">
        {/* Animated Grid Background */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40" />
        
        {/* Floating Background Shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              y: [0, -30, 0],
              x: [0, 20, 0],
              rotate: [0, 10, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute top-20 right-20 w-64 h-64 bg-secondary/5 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              y: [0, 40, 0],
              x: [0, -30, 0],
              rotate: [0, -15, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute bottom-20 left-20 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              y: [0, -20, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute top-1/2 left-1/2 w-72 h-72 bg-secondary/3 rounded-full blur-3xl"
          />
        </div>
        
        <div className="container-custom relative py-20 md:py-32">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-md border border-white/30 rounded-full text-white text-sm font-medium mb-6"
            >
              <Award className="h-4 w-4" />
              <span>Trusted by 10,000+ customers</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-5xl md:text-6xl font-bold mb-6 leading-tight"
            >
              Your Financial Goals,
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="block bg-gradient-to-r from-accent to-accentHover bg-clip-text text-transparent"
              >
                Our Priority
              </motion.span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-xl text-white/95 mb-8 leading-relaxed"
            >
              Experience hassle-free loan approvals with our digital platform. 
              From personal loans to home mortgages, we've got you covered.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-wrap gap-4"
            >
              <Link to="/loan-types">
                <motion.button
                  whileHover={{
                    scale: 1.02,
                    boxShadow: '0 0 25px rgba(79, 70, 229, 0.5)'
                  }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 bg-white text-[#0F172A] rounded-xl font-semibold flex items-center gap-2 shadow-lg transition-all hover:shadow-xl"
                >
                  Explore Loans
                  <ArrowRight className="h-5 w-5" />
                </motion.button>
              </Link>
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl font-semibold hover:bg-white/20 transition-colors"
                >
                  Get Started
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full h-auto">
            <path fill="#FFFFFF" fillOpacity="1" d="M0,64L60,69.3C120,75,240,85,360,80C480,75,600,53,720,48C840,43,960,53,1080,58.7C1200,64,1320,64,1380,64L1440,64L1440,120L1380,120C1320,120,1200,120,1080,120C960,120,840,120,720,120C600,120,480,120,360,120C240,120,120,120,60,120L0,120Z"></path>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-transparent">
        <div className="container-custom">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-foreground dark:text-foregroundDark mb-4">
              Why Choose Us?
            </h2>
            <p className="text-xl text-foregroundSecondary dark:text-foregroundSecondaryDark max-w-2xl mx-auto">
              We make loan approvals fast, secure, and hassle-free
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  variants={cardVariants}
                  custom={index}
                  whileHover="hover"
                  className="card"
                >
                  <div className="h-12 w-12 bg-secondary/10 dark:bg-secondary/20 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-foreground dark:text-foregroundDark" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground dark:text-foregroundDark mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-foregroundSecondary dark:text-foregroundSecondaryDark">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-surface dark:bg-transparent">
        <div className="container-custom">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-foreground dark:text-foregroundDark mb-4">
              How It Works
            </h2>
            <p className="text-xl text-foregroundSecondary dark:text-foregroundSecondaryDark max-w-2xl mx-auto">
              Four simple steps to get your loan approved
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                custom={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="relative"
              >
                <div className="text-center">
                  <div className="inline-flex items-center justify-center h-16 w-16 bg-gradient-to-br from-secondary to-primary text-white rounded-2xl font-bold text-2xl mb-4 shadow-soft">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-bold text-foreground dark:text-foregroundDark mb-2">
                    {step.title}
                  </h3>
                  <p className="text-foregroundSecondary dark:text-foregroundSecondaryDark">
                    {step.description}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-secondary to-transparent -ml-4" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-backgroundDark to-surfaceDark text-white">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-4xl font-bold mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-foregroundSecondary dark:text-foregroundSecondaryDark mb-8">
              Join thousands of satisfied customers who trusted us with their financial needs
            </p>
            <Link to="/register">
              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                className="px-8 py-4 bg-secondary dark:bg-secondaryDark text-white hover:bg-secondary/90 dark:hover:bg-secondaryDark/90 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Apply Now
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
};

export default Home;
