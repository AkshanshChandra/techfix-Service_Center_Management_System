import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap, Smartphone, Laptop, Monitor, Printer, Tablet, Watch, Headphones,
  CheckCircle, Star, BarChart3, Users, Wrench, Package, Shield, Clock,
  ArrowRight, Play, TrendingUp, Award, Cpu, Phone, Mail, MapPin
} from 'lucide-react';

const services = [
  { icon: Smartphone, title: 'Mobile Phones', desc: 'Screen, battery, charging ports, water damage & complete diagnostics', color: 'text-blue-600', bg: 'bg-blue-50' },
  { icon: Laptop, title: 'Laptops', desc: 'Motherboard repair, GPU replacement, data recovery, keyboard & more', color: 'text-purple-600', bg: 'bg-purple-50' },
  { icon: Monitor, title: 'Desktop Computers', desc: 'Component upgrades, virus removal, cooling & system assembly', color: 'text-teal-600', bg: 'bg-teal-50' },
  { icon: Printer, title: 'Printers', desc: 'Print head cleaning, cartridge issues, roller replacement & calibration', color: 'text-red-600', bg: 'bg-red-50' },
  { icon: Tablet, title: 'Tablets', desc: 'Digitizer, glass, charging port & complete hardware repair', color: 'text-orange-600', bg: 'bg-orange-50' },
  { icon: Watch, title: 'Smart Watches', desc: 'Screen replacement, battery swap, strap repair & sensor calibration', color: 'text-green-600', bg: 'bg-green-50' },
  { icon: Headphones, title: 'Accessories', desc: 'Earbuds, speakers, power banks, cables & peripheral devices', color: 'text-indigo-600', bg: 'bg-indigo-50' },
];

const features = [
  { icon: BarChart3, title: 'Real-time Analytics', desc: 'Track repairs, revenue, and technician performance with live dashboards' },
  { icon: Users, title: 'Customer Management', desc: 'Complete customer profiles with repair history, invoices, and warranties' },
  { icon: Wrench, title: 'Kanban Repair Tracking', desc: 'Visual board to track every repair from received to delivered' },
  { icon: Package, title: 'Smart Inventory', desc: 'Automated low-stock alerts and supplier management' },
  { icon: Shield, title: 'Warranty Management', desc: 'Track and manage warranties for every completed repair' },
  { icon: Clock, title: 'Job Scheduling', desc: 'Assign technicians, set priorities, and track estimated delivery times' },
];

const stats = [
  { value: '2,500+', label: 'Repairs Completed', icon: Wrench },
  { value: '1,200+', label: 'Happy Customers', icon: Users },
  { value: '98%', label: 'Satisfaction Rate', icon: Star },
  { value: '6', label: 'Expert Technicians', icon: Award },
];

const testimonials = [
  { name: 'Priya Sharma', role: 'Regular Customer', text: 'My iPhone 15 Pro screen was replaced in just 2 hours. The quality is excellent and the pricing is transparent. Highly recommended!', rating: 5, avatar: 'PS', color: 'bg-purple-500' },
  { name: 'Vikram Singh', role: 'Business Client', text: 'TechFix recovered critical data from my crashed hard drive. Their data recovery team is outstanding. I was able to track the status in real-time.', rating: 5, avatar: 'VS', color: 'bg-indigo-500' },
  { name: 'Kavya Nair', role: 'Frequent Customer', text: 'I\'ve been using TechFix for 2 years now. From laptop repairs to smart watch screen replacements — always professional and on time.', rating: 5, avatar: 'KN', color: 'bg-orange-500' },
];

const whyUs = [
  { title: 'Certified Technicians', desc: 'Apple, Samsung & HP certified experts with 2-8 years of experience' },
  { title: 'Genuine Parts', desc: 'OEM & genuine parts with full warranty — no cheap substitutes' },
  { title: 'Live Job Tracking', desc: 'Real-time status updates via SMS/WhatsApp throughout the repair' },
  { title: '90-Day Warranty', desc: 'All repairs backed by comprehensive 90-day warranty coverage' },
  { title: 'Fast Turnaround', desc: 'Most repairs completed same-day or within 24-48 hours' },
  { title: 'No-Fix, No-Fee', desc: 'You only pay if your device is successfully repaired' },
];

export default function LandingPage() {
  const navigate = useNavigate();

  const fadeUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 },
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 glass border-b border-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-accent-500 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-base font-bold text-secondary-900">TechFix</span>
              <p className="text-[10px] text-secondary-400 -mt-0.5 leading-none">Service Center</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-secondary-600">
            {['Services', 'Why Us', 'Features', 'Contact'].map(item => (
              <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="hover:text-primary-600 transition-colors">{item}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="hidden sm:block px-4 py-2 text-sm font-medium text-secondary-700 hover:text-primary-600 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-sm font-semibold rounded-xl hover:shadow-glow transition-all duration-200 hover:-translate-y-0.5"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-28 pb-20 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 gradient-bg" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent-200/30 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 bg-primary-50 border border-primary-100 text-primary-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-pulse" />
              Mumbai's #1 Device Repair Management System
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-secondary-900 leading-tight tracking-tight"
          >
            Professional Device{' '}
            <span className="gradient-text">Repair Management</span>{' '}
            System
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg text-secondary-600 max-w-2xl mx-auto leading-relaxed"
          >
            Manage customers, repair jobs, inventory, technicians, invoices and reports
            from one powerful dashboard — designed for modern service centers.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button
              onClick={() => navigate('/dashboard')}
              className="group flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-2xl hover:shadow-glow transition-all duration-200 hover:-translate-y-0.5 text-base"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="group flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-secondary-800 font-semibold rounded-2xl border border-secondary-200 hover:border-primary-300 hover:text-primary-600 transition-all duration-200 hover:-translate-y-0.5 shadow-sm text-base"
            >
              <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center">
                <Play className="w-3 h-3 text-primary-600 ml-0.5" />
              </div>
              Live Demo
            </button>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto"
          >
            {stats.map(({ value, label, icon: Icon }) => (
              <div key={label} className="text-center">
                <div className="flex justify-center mb-2">
                  <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary-600" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-secondary-900">{value}</div>
                <div className="text-sm text-secondary-500 mt-0.5">{label}</div>
              </div>
            ))}
          </motion.div>

          {/* Dashboard preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-16 relative"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-secondary-100 overflow-hidden max-w-5xl mx-auto">
              <div className="bg-secondary-900 px-4 py-2.5 flex items-center gap-2">
                <div className="flex gap-1.5">
                  {['bg-red-400', 'bg-amber-400', 'bg-green-400'].map(c => (
                    <div key={c} className={`w-3 h-3 rounded-full ${c}`} />
                  ))}
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-secondary-700 rounded-md px-4 py-1 text-xs text-secondary-400 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                    techfix.app/dashboard
                  </div>
                </div>
              </div>
              <div className="p-6 bg-secondary-50">
                {/* Mini dashboard mockup */}
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {[
                    { label: 'Active Repairs', val: '14', color: 'bg-blue-500' },
                    { label: 'Ready', val: '3', color: 'bg-teal-500' },
                    { label: 'Revenue', val: '₹2.4L', color: 'bg-purple-500' },
                    { label: 'Customers', val: '148', color: 'bg-amber-500' },
                  ].map(({ label, val, color }) => (
                    <div key={label} className="bg-white rounded-xl p-3 shadow-sm border border-secondary-100">
                      <div className={`w-2 h-2 rounded-full ${color} mb-2`} />
                      <div className="text-lg font-bold text-secondary-900">{val}</div>
                      <div className="text-xs text-secondary-500">{label}</div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-5 gap-3">
                  <div className="col-span-3 bg-white rounded-xl p-4 shadow-sm border border-secondary-100 h-32">
                    <p className="text-xs font-medium text-secondary-500 mb-3">Monthly Revenue</p>
                    <div className="flex items-end gap-2 h-16">
                      {[40, 65, 45, 80, 60, 90, 75].map((h, i) => (
                        <div key={i} className="flex-1 bg-primary-100 rounded-t" style={{ height: `${h}%` }}>
                          <div className="w-full bg-gradient-to-t from-primary-600 to-primary-400 rounded-t h-full" />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="col-span-2 bg-white rounded-xl p-4 shadow-sm border border-secondary-100 h-32">
                    <p className="text-xs font-medium text-secondary-500 mb-2">Repair Categories</p>
                    <div className="space-y-1.5">
                      {[
                        { label: 'Laptops', pct: 35, color: 'bg-primary-500' },
                        { label: 'Mobile', pct: 45, color: 'bg-accent-500' },
                        { label: 'Tablets', pct: 20, color: 'bg-purple-500' },
                      ].map(({ label, pct, color }) => (
                        <div key={label}>
                          <div className="flex justify-between text-xs mb-0.5">
                            <span className="text-secondary-600">{label}</span>
                            <span className="text-secondary-400">{pct}%</span>
                          </div>
                          <div className="h-1.5 bg-secondary-100 rounded-full">
                            <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-14">
            <span className="text-xs font-semibold text-primary-600 uppercase tracking-widest">What We Fix</span>
            <h2 className="text-3xl font-bold text-secondary-900 mt-2">Comprehensive Repair Services</h2>
            <p className="text-secondary-500 mt-3 max-w-xl mx-auto">Expert technicians for all your device repair needs — from minor fixes to complex motherboard repairs</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {services.map(({ icon: Icon, title, desc, color, bg }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                whileHover={{ y: -4 }}
                className="p-5 bg-white rounded-2xl border border-secondary-100 hover:border-primary-200 shadow-card hover:shadow-card-hover transition-all duration-200 cursor-pointer group"
              >
                <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <h3 className="font-semibold text-secondary-900 mb-1.5">{title}</h3>
                <p className="text-sm text-secondary-500 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="why-us" className="py-20 gradient-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-14">
            <span className="text-xs font-semibold text-accent-600 uppercase tracking-widest">Why TechFix</span>
            <h2 className="text-3xl font-bold text-secondary-900 mt-2">Built for Service Excellence</h2>
            <p className="text-secondary-500 mt-3 max-w-xl mx-auto">We combine cutting-edge management software with expert technicians to deliver unmatched repair quality</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {whyUs.map(({ title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="flex gap-4 bg-white p-5 rounded-2xl shadow-card border border-white"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="w-4.5 h-4.5 text-white" style={{ width: '18px', height: '18px' }} />
                </div>
                <div>
                  <h3 className="font-semibold text-secondary-900 mb-1">{title}</h3>
                  <p className="text-sm text-secondary-500 leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-secondary-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-14">
            <span className="text-xs font-semibold text-accent-400 uppercase tracking-widest">Dashboard Features</span>
            <h2 className="text-3xl font-bold text-white mt-2">Everything You Need to Run a Repair Shop</h2>
            <p className="text-secondary-400 mt-3 max-w-xl mx-auto">A complete suite of tools designed for modern device repair businesses</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                whileHover={{ y: -4 }}
                className="bg-secondary-800 border border-secondary-700 hover:border-primary-500/50 rounded-2xl p-5 transition-all duration-200 group"
              >
                <div className="w-11 h-11 bg-primary-600/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-600/30 transition-colors">
                  <Icon className="w-5 h-5 text-primary-400" />
                </div>
                <h3 className="font-semibold text-white mb-1.5">{title}</h3>
                <p className="text-sm text-secondary-400 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-14">
            <span className="text-xs font-semibold text-primary-600 uppercase tracking-widest">Testimonials</span>
            <h2 className="text-3xl font-bold text-secondary-900 mt-2">Loved by Customers</h2>
            <p className="text-secondary-500 mt-3">Real reviews from real customers across Mumbai</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(({ name, role, text, rating, avatar, color }, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="bg-secondary-50 rounded-2xl p-6 border border-secondary-100"
              >
                <div className="flex gap-0.5 mb-4">
                  {Array(rating).fill(0).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-secondary-700 text-sm leading-relaxed mb-5">"{text}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${color} rounded-full flex items-center justify-center text-white text-sm font-bold`}>
                    {avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-secondary-900 text-sm">{name}</p>
                    <p className="text-xs text-secondary-500">{role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-primary-800 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-accent-400/10 rounded-full blur-3xl" />
        </div>
        <motion.div {...fadeUp} className="relative max-w-3xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Modernize Your Repair Shop?</h2>
          <p className="text-primary-200 mb-8 text-base">Join hundreds of repair centers managing smarter with TechFix</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-8 py-3.5 bg-white text-primary-700 font-semibold rounded-2xl hover:bg-primary-50 transition-colors shadow-lg text-base"
            >
              Launch Dashboard
            </button>
            <button className="px-8 py-3.5 border-2 border-white/30 text-white font-semibold rounded-2xl hover:bg-white/10 transition-colors text-base">
              Book a Demo
            </button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary-900 text-secondary-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-accent-500 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-bold">TechFix</span>
              </div>
              <p className="text-sm leading-relaxed">Mumbai's premier device repair management system — trusted by service centers across the city.</p>
              <div className="flex gap-3 mt-4">
                {['Twitter', 'LinkedIn', 'Instagram'].map(s => (
                  <button key={s} className="text-xs text-secondary-500 hover:text-primary-400 transition-colors">{s}</button>
                ))}
              </div>
            </div>
            {[
              { title: 'Services', links: ['Mobile Repair', 'Laptop Repair', 'Tablet Repair', 'Printer Service', 'Data Recovery'] },
              { title: 'Dashboard', links: ['Customers', 'Repair Jobs', 'Technicians', 'Inventory', 'Reports'] },
              { title: 'Contact', links: [] },
            ].map(({ title, links }) => (
              <div key={title}>
                <h4 className="text-white font-semibold mb-4 text-sm">{title}</h4>
                {title === 'Contact' ? (
                  <div className="space-y-3">
                    <div className="flex gap-2 text-sm"><Phone className="w-4 h-4 text-primary-500 flex-shrink-0" /><span>+91 98765 00000</span></div>
                    <div className="flex gap-2 text-sm"><Mail className="w-4 h-4 text-primary-500 flex-shrink-0" /><span>support@techfix.in</span></div>
                    <div className="flex gap-2 text-sm"><MapPin className="w-4 h-4 text-primary-500 flex-shrink-0" /><span>Andheri West, Mumbai 400053</span></div>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {links.map(l => (
                      <li key={l}><button className="text-sm hover:text-primary-400 transition-colors">{l}</button></li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
          <div className="border-t border-secondary-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-sm">© 2024 TechFix Service Center. Built for NMIMS Software Engineering Project.</p>
            <div className="flex gap-4 text-xs">
              <button className="hover:text-primary-400 transition-colors">Privacy Policy</button>
              <button className="hover:text-primary-400 transition-colors">Terms of Service</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
