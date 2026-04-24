import { Github, Twitter, Linkedin, Mail, Heart } from 'lucide-react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        product: [
            { name: 'Features', href: '#' },
            { name: 'Pricing', href: '#' },
            { name: 'API', href: '#' },
            { name: 'Integrations', href: '#' },
        ],
        company: [
            { name: 'About', href: '#' },
            { name: 'Blog', href: '#' },
            { name: 'Careers', href: '#' },
            { name: 'Contact', href: '#' },
        ],
        legal: [
            { name: 'Privacy', href: '#' },
            { name: 'Terms', href: '#' },
            { name: 'Cookie Policy', href: '#' },
        ],
    };

    return (
        <footer className="bg-[#0A0918] border-t border-purple-900/30">
            <div className="px-4 sm:px-20 xl:px-32 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
                    {/* Brand Section */}
                    <div className="lg:col-span-2">
                        <div className='flex items-center mb-6'>
                            <img src="/logo.png" alt="Photonix AI" className='h-12 w-auto max-w-[190px] object-contain' />
                        </div>
                        <p className="text-gray-400 mb-6 max-w-sm leading-relaxed">
                            Experience the power of AI with Photonix AI. Generate, restore, enhance, and refine photos with premium AI tools.
                        </p>

                        {/* Newsletter */}
                        <div className='space-y-3'>
                            <p className='text-sm text-gray-300 font-medium'>Subscribe to our newsletter</p>
                            <div className='flex gap-2'>
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className='flex-1 px-4 py-2.5 rounded-lg bg-[#1A1730] border border-purple-900/50 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors'
                                />
                                <button className='px-5 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white rounded-lg font-medium transition-all duration-300'>
                                    Subscribe
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Product</h3>
                        <ul className="space-y-3">
                            {footerLinks.product.map((link) => (
                                <li key={link.name}>
                                    <a href={link.href} className="text-gray-400 hover:text-pink-400 transition-colors">
                                        {link.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Company</h3>
                        <ul className="space-y-3">
                            {footerLinks.company.map((link) => (
                                <li key={link.name}>
                                    <a href={link.href} className="text-gray-400 hover:text-pink-400 transition-colors">
                                        {link.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Legal</h3>
                        <ul className="space-y-3">
                            {footerLinks.legal.map((link) => (
                                <li key={link.name}>
                                    <a href={link.href} className="text-gray-400 hover:text-pink-400 transition-colors">
                                        {link.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-16 pt-8 border-t border-purple-900/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-gray-500 text-sm flex items-center gap-1">
                        &copy; {currentYear} Photonix AI. Developed by Sarker Mohammad Riduan
                    </p>

                    {/* Social Links */}
                    <div className="flex items-center gap-4">
                        <a href="#" className="w-10 h-10 rounded-lg bg-[#1A1730] border border-purple-900/50 flex items-center justify-center text-gray-400 hover:text-pink-400 hover:border-pink-500/50 transition-all">
                            <Twitter className="w-5 h-5" />
                        </a>
                        <a href="#" className="w-10 h-10 rounded-lg bg-[#1A1730] border border-purple-900/50 flex items-center justify-center text-gray-400 hover:text-pink-400 hover:border-pink-500/50 transition-all">
                            <Github className="w-5 h-5" />
                        </a>
                        <a href="#" className="w-10 h-10 rounded-lg bg-[#1A1730] border border-purple-900/50 flex items-center justify-center text-gray-400 hover:text-pink-400 hover:border-pink-500/50 transition-all">
                            <Linkedin className="w-5 h-5" />
                        </a>
                        <a href="#" className="w-10 h-10 rounded-lg bg-[#1A1730] border border-purple-900/50 flex items-center justify-center text-gray-400 hover:text-pink-400 hover:border-pink-500/50 transition-all">
                            <Mail className="w-5 h-5" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
