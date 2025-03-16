import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Heart,Hourglass, Umbrella, PiggyBank, Car, Bike, Users, Plane, UserCheck, RotateCw, Coins, Baby, Wallet, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { authUtils } from './utils/auth';
const professions = [
  { icon: "🏦", text: "Bankers" },
  { icon: "📊", text: "Consultants" },
  { icon: "💼", text: "Investors" },
  { icon: "📈", text: "Traders" },
  { icon: "🏢", text: "Fund Managers" }
];


const InsuranceCard = ({ title, icon: Icon, tag, className = "" }) => (
  <motion.div
    whileHover={{ scale: 1.05, y: -5 }}
    whileTap={{ scale: 0.95 }}
    className="relative bg-gradient-to-br from-black/90 via-amber-900/20 to-black/90 rounded-xl p-6 
    border border-amber-500/20 hover:border-amber-500/40 transition-all duration-300 cursor-pointer
    backdrop-blur-md group"
  >
    {tag && (
      <div className="absolute -top-3 right-4 px-3 py-1 rounded-full text-xs font-medium 
      bg-green-500/20 text-green-400 border border-green-500/30">
        {tag}
      </div>
    )}
    <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/20 
    flex items-center justify-center mb-4 group-hover:from-amber-500/30 group-hover:to-amber-600/30 
    transition-all duration-300">
      <Icon className="h-8 w-8 text-amber-400 group-hover:text-amber-300 transition-colors" />
    </div>
    <h3 className="text-lg font-medium text-amber-200 group-hover:text-amber-100">{title}</h3>
  </motion.div>
);

const InsuranceGrid = () => {
  const products = [
    { title: 'Term Life Insurance', icon: Umbrella, tag: 'Upto 10% Discount' },
    { title: 'Health Insurance', icon: Heart, tag: 'FREE Home Visit' },
    { title: 'Investment Plans', icon: PiggyBank, tag: 'In-Built Life Cover' },
    { title: 'Car Insurance', icon: Car, tag: 'Upto 85% Discount' },
    { title: '2 Wheeler Insurance', icon: Bike, tag: 'Upto 25% Discount' },
    { title: 'Family Health Insurance', icon: Users, tag: 'Upto 25% Discount' },
    { title: 'Travel Insurance', icon: Plane, tag: null },
    { title: 'Term Insurance (Women)', icon: UserCheck, tag: 'Upto 20% Cheaper' },
    { title: 'Guaranteed Return Plans', icon: Coins, tag: null },
    { title: 'Child Savings Plans', icon: Baby, tag: 'Premium Waiver' },
    { title: 'Retirement Plans', icon: Wallet, tag: null },
    { title: 'Home Insurance', icon: Home, tag: 'Upto 25% Discount' },
    { title: 'Term Plans with Return of Premium', icon: RotateCw, tag: null },
    { title: 'Employee Group Health Insurance', icon: Users, tag: 'Upto 65% Discount' }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 pt-36 pb-16">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h2 className="text-4xl font-bold bg-gradient-to-r from-amber-200 to-yellow-400 bg-clip-text text-transparent mb-4">
          Insurance Solutions
        </h2>
        <p className="text-amber-200/70 text-lg">
          Comprehensive coverage for every aspect of your life
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product, index) => (
          <motion.div
            key={product.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <InsuranceCard {...product} />
          </motion.div>
        ))}
      </div>

      <motion.div 
        className="text-center mt-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-semibold 
          rounded-lg hover:from-amber-400 hover:to-yellow-400 transition-all duration-200 
          shadow-lg shadow-amber-500/20"
        >
          View all products
        </motion.button>
      </motion.div>
    </div>
  );
};

const AnimatedProfessions = () => {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % professions.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-12 relative flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute flex items-center space-x-3"
        >
          <span className="text-2xl">{professions[currentIndex].icon}</span>
          <span className="text-xl font-medium bg-gradient-to-r from-amber-200 to-yellow-400 bg-clip-text text-transparent">
            {professions[currentIndex].text}
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const FadeInWhenVisible = ({ children, delay = 0 }) => {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.8,
        delay: delay,
        ease: [0.4, 0, 0.2, 1]
      }}
    >
      {children}
    </motion.div>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();
  const isAuthenticated = authUtils.isAuthenticated();
  const currentUser = authUtils.getCurrentUser();

  

  const handleLogout = () => {
    authUtils.logout();
    window.location.reload();
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Premium Background Elements */}
      <div className="absolute inset-0">
        {/* Dynamic gradient background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-700/20 via-black to-black" />
        
        {/* Animated mesh gradient */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ duration: 2 }}
          className="absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(120deg, #000000 0%, rgba(198, 163, 85, 0.2) 100%)',
            filter: 'blur(100px)',
          }}
        />

        {/* Animated particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-amber-400/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100, 0],
                x: [0, Math.random() * 50 - 25, 0],
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Premium light effects */}
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="absolute top-0 left-1/4 w-1/2 h-1/2 bg-gradient-to-br from-amber-500/20 to-transparent rotate-12 blur-3xl transform-gpu" />
          <div className="absolute bottom-0 right-1/4 w-1/2 h-1/2 bg-gradient-to-tl from-amber-500/20 to-transparent -rotate-12 blur-3xl transform-gpu" />
        </motion.div>

        {/* Interactive hover effect */}
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            backgroundImage: 'radial-gradient(circle at center, rgba(198, 163, 85, 0.3) 0%, transparent 50%)',
            backgroundSize: '100% 100%',
          }}
        />
        
        {/* Overlay gradient for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Navigation */}
    <motion.nav 
  className="flex items-center px-6 py-4 bg-black/50 backdrop-blur-md border-b border-amber-500/20"
  initial={{ y: -20, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  transition={{ duration: 0.6 }}
>
  {/* Left Buttons */}
  <div className="hidden md:flex items-center font-serif space-x-6 ">
    <Link to="/about" className="text-amber-100/80 hover:text-amber-400 transition-colors">About</Link>
    <Link to="/pricing" className="text-amber-100/80 hover:text-amber-400 transition-colors">Pricing</Link>
    <Link to="/blog" className="text-amber-100/80 hover:text-amber-400 transition-colors">Blog</Link>
  </div>

  {/* Logo */}
  <motion.div 
  className="flex items-center justify-center cursor-pointer absolute inset-x-0 mx-auto"
  whileHover={{ scale: 1.05 }}
  onClick={() => navigate('/')}
  transition={{ type: "spring", stiffness: 400, damping: 10 }}
>
  <Hourglass className="h-5 w-5 text-amber-400 mb-[2px]" />
  <div className="text-2xl font-serif font-extrabold bg-gradient-to-r from-amber-200 to-yellow-400 bg-clip-text text-transparent">
    PaisaBay
  </div>
</motion.div>


</motion.nav>


        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 mt-20">
          <motion.div 
            className="text-center space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
           
            {/* Main Headlines */}
            <div className="mb-14">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <motion.h1 
                  className="text-7xl font-sans tracking-wide font-bold text-white leading-normal"
                 
                  style={{
                    backgroundSize: "200% auto",
                    backgroundImage: "linear-gradient(90deg, #fff, #C6A355, #fff)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  PaisaBay
                </motion.h1>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <motion.h2 
                  className="text-6xl font-sans font-bold bg-gradient-to-r from-amber-200 to-yellow-400 bg-clip-text text-transparent leading-normal"
                 
                >
                  Chat With Your Policies
                </motion.h2>
              </motion.div>
            </div>

            {/* Subtitle */}
            <FadeInWhenVisible delay={0.8}>
              <p className="text-xl font-serif text-amber-100/80 max-w-2xl mx-auto mt-6">
              An AI-powered Financial Advisory Marketplace              </p>
            </FadeInWhenVisible>

            {/* CTA Button */}
            <FadeInWhenVisible delay={1}>
              <div className="mt-12">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/chat')}
                  className="px-8 font-serif  py-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-semibold text-lg rounded-lg 
                  hover:from-amber-400 hover:to-yellow-400 transition-all duration-200 shadow-lg shadow-amber-500/20"
                >
                 {isAuthenticated ? 'Chat With AI' : 'Get Started'}
                </motion.button>
              </div>
            </FadeInWhenVisible>
          </motion.div>
        </main>
        <InsuranceGrid />
      </div>
    </div>
  );
};

export default LandingPage;